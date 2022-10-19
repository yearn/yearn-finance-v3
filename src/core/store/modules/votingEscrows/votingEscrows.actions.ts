import { createAction, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import {
  Address,
  Position,
  TokenAllowance,
  TransactionOutcome,
  Unit,
  VotingEscrow,
  VotingEscrowDynamic,
  VotingEscrowTransactionType,
  VotingEscrowUserMetadata,
  Weeks,
} from '@types';
import { getNetwork, validateNetwork, parseError, toWei } from '@utils';

import { TokensActions } from '../tokens/tokens.actions';

/* -------------------------------------------------------------------------- */
/*                                   Setters                                  */
/* -------------------------------------------------------------------------- */

const setSelectedVotingEscrowAddress = createAction<{ votingEscrowAddress?: string }>(
  'votingEscrows/setSelectedVotingEscrowAddress'
);

/* -------------------------------------------------------------------------- */
/*                                 Clear State                                */
/* -------------------------------------------------------------------------- */

const clearVotingEscrowsData = createAction<void>('votingEscrows/clearVotingEscrowsData');
const clearUserData = createAction<void>('votingEscrows/clearUserData');
const clearSelectedVotingEscrow = createAction<void>('votingEscrows/clearSelectedVotingEscrow');

/* -------------------------------------------------------------------------- */
/*                                 Fetch Data                                 */
/* -------------------------------------------------------------------------- */

const initiateVotingEscrows = createAsyncThunk<void, void, ThunkAPI>(
  'votingEscrows/initiateVotingEscrows',
  async (_arg, { dispatch }) => {
    const result = await dispatch(getVotingEscrows({}));
    const { votingEscrows } = unwrapResult(result);
    await dispatch(setSelectedVotingEscrowAddress({ votingEscrowAddress: votingEscrows[0]?.address }));
  }
);

const getVotingEscrows = createAsyncThunk<{ votingEscrows: VotingEscrow[] }, { addresses?: Address[] }, ThunkAPI>(
  'votingEscrows/getVotingEscrows',
  async ({ addresses }, { extra }) => {
    const { votingEscrowService } = extra.services;
    const { NETWORK } = extra.config;
    const votingEscrows = await votingEscrowService.getSupportedVotingEscrows({ network: NETWORK, addresses });
    return { votingEscrows };
  }
);

const getVotingEscrowsDynamic = createAsyncThunk<
  { votingEscrowsDynamic: VotingEscrowDynamic[] },
  { addresses: Address[] },
  ThunkAPI
>('votingEscrows/getVotingEscrowsDynamic', async ({ addresses }, { extra }) => {
  const { votingEscrowService } = extra.services;
  const { NETWORK } = extra.config;
  const votingEscrowsDynamic = await votingEscrowService.getVotingEscrowsDynamicData({
    network: NETWORK,
    addresses,
  });
  return { votingEscrowsDynamic };
});

const getUserVotingEscrowsPositions = createAsyncThunk<{ positions: Position[] }, { addresses?: string[] }, ThunkAPI>(
  'votingEscrows/getUserVotingEscrowsPositions',
  async ({ addresses }, { extra, getState }) => {
    const { wallet } = getState();
    const { votingEscrowService } = extra.services;
    const { NETWORK } = extra.config;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const positions = await votingEscrowService.getUserVotingEscrowsPositions({
      network: NETWORK,
      accountAddress,
      addresses,
    });
    return { positions };
  }
);

const getUserVotingEscrowsMetadata = createAsyncThunk<
  { userVotingEscrowsMetadata: VotingEscrowUserMetadata[] },
  { addresses?: string[] },
  ThunkAPI
>('votingEscrows/getUserVotingEscrowsMetadata', async ({ addresses }, { extra, getState }) => {
  const { wallet } = getState();
  const { votingEscrowService } = extra.services;
  const { NETWORK } = extra.config;

  const accountAddress = wallet.selectedAddress;
  if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

  const userVotingEscrowsMetadata = await votingEscrowService.getUserVotingEscrowsMetadata({
    network: NETWORK,
    accountAddress,
    addresses,
  });

  return { userVotingEscrowsMetadata };
});

const getExpectedTransactionOutcome = createAsyncThunk<
  TransactionOutcome,
  {
    transactionType: VotingEscrowTransactionType;
    tokenAddress: Address;
    votingEscrowAddress: Address;
    amount?: Unit;
    time?: Weeks;
  },
  ThunkAPI
>(
  'votingEscrows/getExpectedTransactionOutcome',
  async ({ transactionType, tokenAddress, votingEscrowAddress, amount, time }, { extra, getState }) => {
    const { wallet, tokens } = getState();
    const { votingEscrowService } = extra.services;
    const { NETWORK } = extra.config;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const token = tokens.tokensMap[tokenAddress];
    const transactionOutcome = await votingEscrowService.getExpectedTransactionOutcome({
      network: NETWORK,
      accountAddress,
      transactionType,
      tokenAddress,
      votingEscrowAddress,
      amount: amount ? toWei(amount, parseInt(token.decimals)) : undefined,
      time,
    });

    return transactionOutcome;
  }
);

const getLockAllowance = createAsyncThunk<
  TokenAllowance,
  {
    tokenAddress: Address;
    votingEscrowAddress: Address;
  },
  ThunkAPI
>('votingEscrows/getLockAllowance', async ({ tokenAddress, votingEscrowAddress }, { extra, getState, dispatch }) => {
  const { wallet } = getState();
  const { votingEscrowService } = extra.services;
  const { NETWORK } = extra.config;

  const accountAddress = wallet.selectedAddress;
  if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

  const tokenAllowance = await votingEscrowService.getLockAllowance({
    network: NETWORK,
    accountAddress,
    tokenAddress,
    votingEscrowAddress,
  });

  await dispatch(
    TokensActions.setTokenAllowance({
      tokenAddress,
      spenderAddress: tokenAllowance.spender,
      allowance: tokenAllowance.amount,
    })
  );

  return tokenAllowance;
});

/* -------------------------------------------------------------------------- */
/*                             Transaction Methods                            */
/* -------------------------------------------------------------------------- */

const approveLock = createAsyncThunk<TokenAllowance, { tokenAddress: Address; votingEscrowAddress: Address }, ThunkAPI>(
  'votingEscrows/approveLock',
  async ({ tokenAddress, votingEscrowAddress }, { getState, extra, dispatch }) => {
    const { wallet, network } = getState();
    const { votingEscrowService, transactionService } = extra.services;
    const { NETWORK, MAX_UINT256 } = extra.config;
    const amount = MAX_UINT256;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: NETWORK,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const tx = await votingEscrowService.approveLock({
      network: network.current,
      accountAddress,
      tokenAddress,
      votingEscrowAddress,
      amount,
    });

    await transactionService.handleTransaction({ tx, network: network.current });

    const tokenAllowance = await votingEscrowService.getLockAllowance({
      network: network.current,
      accountAddress,
      tokenAddress,
      votingEscrowAddress,
    });

    await dispatch(
      TokensActions.setTokenAllowance({
        tokenAddress,
        spenderAddress: tokenAllowance.spender,
        allowance: tokenAllowance.amount,
      })
    );

    return tokenAllowance;
  },
  {
    serializeError: parseError,
  }
);

const lock = createAsyncThunk<
  void,
  {
    tokenAddress: Address;
    votingEscrowAddress: Address;
    amount: Unit;
    time: Weeks;
  },
  ThunkAPI
>(
  'votingEscrows/lock',
  async ({ tokenAddress, votingEscrowAddress, amount, time }, { extra, getState, dispatch }) => {
    const { network, wallet, tokens, app } = getState();
    const { votingEscrowService, transactionService } = extra.services;
    const { NETWORK } = extra.config;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: NETWORK,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const token = tokens.tokensMap[tokenAddress];
    const tx = await votingEscrowService.lock({
      network: network.current,
      accountAddress,
      tokenAddress,
      votingEscrowAddress,
      amount: toWei(amount, parseInt(token.decimals)),
      time,
    });

    const notificationsEnabled = app.servicesEnabled.notifications;
    await transactionService.handleTransaction({
      tx,
      network: network.current,
      useExternalService: notificationsEnabled,
    });

    dispatch(getVotingEscrowsDynamic({ addresses: [votingEscrowAddress] }));
    dispatch(getUserVotingEscrowsPositions({ addresses: [votingEscrowAddress] }));
    dispatch(getUserVotingEscrowsMetadata({ addresses: [votingEscrowAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, votingEscrowAddress] }));
  },
  {
    serializeError: parseError,
  }
);

const increaseLockAmount = createAsyncThunk<
  void,
  {
    tokenAddress: Address;
    votingEscrowAddress: Address;
    amount: Unit;
  },
  ThunkAPI
>(
  'votingEscrows/increaseLockAmount',
  async ({ tokenAddress, votingEscrowAddress, amount }, { extra, getState, dispatch }) => {
    const { network, wallet, tokens, app } = getState();
    const { votingEscrowService, transactionService } = extra.services;
    const { NETWORK } = extra.config;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: NETWORK,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const token = tokens.tokensMap[tokenAddress];
    const tx = await votingEscrowService.increaseLockAmount({
      network: network.current,
      accountAddress,
      votingEscrowAddress,
      amount: toWei(amount, parseInt(token.decimals)),
    });

    const notificationsEnabled = app.servicesEnabled.notifications;
    await transactionService.handleTransaction({
      tx,
      network: network.current,
      useExternalService: notificationsEnabled,
    });

    dispatch(getVotingEscrowsDynamic({ addresses: [votingEscrowAddress] }));
    dispatch(getUserVotingEscrowsPositions({ addresses: [votingEscrowAddress] }));
    dispatch(getUserVotingEscrowsMetadata({ addresses: [votingEscrowAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, votingEscrowAddress] }));
  },
  {
    serializeError: parseError,
  }
);

const extendLockTime = createAsyncThunk<
  void,
  {
    tokenAddress: Address;
    votingEscrowAddress: Address;
    time: Weeks;
  },
  ThunkAPI
>(
  'votingEscrows/extendLockTime',
  async ({ tokenAddress, votingEscrowAddress, time }, { extra, getState, dispatch }) => {
    const { network, wallet, app } = getState();
    const { votingEscrowService, transactionService } = extra.services;
    const { NETWORK } = extra.config;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: NETWORK,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const tx = await votingEscrowService.extendLockTime({
      network: network.current,
      accountAddress,
      votingEscrowAddress,
      time,
    });

    const notificationsEnabled = app.servicesEnabled.notifications;
    await transactionService.handleTransaction({
      tx,
      network: network.current,
      useExternalService: notificationsEnabled,
    });

    dispatch(getVotingEscrowsDynamic({ addresses: [votingEscrowAddress] }));
    dispatch(getUserVotingEscrowsPositions({ addresses: [votingEscrowAddress] }));
    dispatch(getUserVotingEscrowsMetadata({ addresses: [votingEscrowAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, votingEscrowAddress] }));
  },
  {
    serializeError: parseError,
  }
);

const withdrawLocked = createAsyncThunk<void, { tokenAddress: Address; votingEscrowAddress: Address }, ThunkAPI>(
  'votingEscrows/withdrawLocked',
  async ({ tokenAddress, votingEscrowAddress }, { extra, getState, dispatch }) => {
    const { network, wallet, app } = getState();
    const { votingEscrowService, transactionService } = extra.services;
    const { NETWORK } = extra.config;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: NETWORK,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const tx = await votingEscrowService.withdrawLocked({
      network: network.current,
      accountAddress,
      votingEscrowAddress,
    });

    const notificationsEnabled = app.servicesEnabled.notifications;
    await transactionService.handleTransaction({
      tx,
      network: network.current,
      useExternalService: notificationsEnabled,
    });

    dispatch(getVotingEscrowsDynamic({ addresses: [votingEscrowAddress] }));
    dispatch(getUserVotingEscrowsPositions({ addresses: [votingEscrowAddress] }));
    dispatch(getUserVotingEscrowsMetadata({ addresses: [votingEscrowAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, votingEscrowAddress] }));
  },
  {
    serializeError: parseError,
  }
);

const withdrawUnlocked = createAsyncThunk<void, { tokenAddress: Address; votingEscrowAddress: Address }, ThunkAPI>(
  'votingEscrows/withdrawUnlocked',
  async ({ tokenAddress, votingEscrowAddress }, { extra, getState, dispatch }) => {
    const { network, wallet, app } = getState();
    const { votingEscrowService, transactionService } = extra.services;
    const { NETWORK } = extra.config;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: NETWORK,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const tx = await votingEscrowService.withdrawUnlocked({
      network: network.current,
      accountAddress,
      votingEscrowAddress,
    });

    const notificationsEnabled = app.servicesEnabled.notifications;
    await transactionService.handleTransaction({
      tx,
      network: network.current,
      useExternalService: notificationsEnabled,
    });

    dispatch(getVotingEscrowsDynamic({ addresses: [votingEscrowAddress] }));
    dispatch(getUserVotingEscrowsPositions({ addresses: [votingEscrowAddress] }));
    dispatch(getUserVotingEscrowsMetadata({ addresses: [votingEscrowAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, votingEscrowAddress] }));
  },
  {
    serializeError: parseError,
  }
);

// NOTE: just for testing env
const mint = createAsyncThunk<void, { tokenAddress: Address; amount: Unit }, ThunkAPI>(
  'votingEscrows/mint',
  async ({ tokenAddress, amount }, { extra, getState, dispatch }) => {
    const { network, wallet, tokens, app } = getState();
    const { votingEscrowService, transactionService } = extra.services;
    const { NETWORK } = extra.config;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: NETWORK,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const token = tokens.tokensMap[tokenAddress];
    const tx = await votingEscrowService.mint({
      network: network.current,
      accountAddress,
      tokenAddress,
      amount: toWei(amount, parseInt(token.decimals)),
    });

    const notificationsEnabled = app.servicesEnabled.notifications;
    await transactionService.handleTransaction({
      tx,
      network: network.current,
      useExternalService: notificationsEnabled,
    });

    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress] }));
  },
  {
    serializeError: parseError,
  }
);

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export const VotingEscrowsActions = {
  setSelectedVotingEscrowAddress,
  clearVotingEscrowsData,
  clearUserData,
  clearSelectedVotingEscrow,
  initiateVotingEscrows,
  getVotingEscrows,
  getVotingEscrowsDynamic,
  getUserVotingEscrowsPositions,
  getUserVotingEscrowsMetadata,
  getExpectedTransactionOutcome,
  getLockAllowance,
  approveLock,
  lock,
  increaseLockAmount,
  extendLockTime,
  withdrawLocked,
  withdrawUnlocked,
  mint,
};
