import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { Address, Position, TokenAllowance, Unit, VotingEscrow, VotingEscrowDynamic, Week } from '@types';
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
    await dispatch(getVotingEscrows({}));
  }
);

const getVotingEscrows = createAsyncThunk<{ votingEscrows: VotingEscrow[] }, { addresses?: Address[] }, ThunkAPI>(
  'votingEscrows/getVotingEscrows',
  async ({ addresses }, { getState, extra }) => {
    const { network } = getState();
    const { votingEscrowService } = extra.services;
    const votingEscrows = await votingEscrowService.getSupportedVotingEscrows({ network: network.current, addresses });
    return { votingEscrows };
  }
);

const getVotingEscrowsDynamic = createAsyncThunk<
  { votingEscrowsDynamic: VotingEscrowDynamic[] },
  { addresses: Address[] },
  ThunkAPI
>('votingEscrows/getVotingEscrowsDynamic', async ({ addresses }, { getState, extra }) => {
  const { network } = getState();
  const { votingEscrowService } = extra.services;
  const votingEscrowsDynamic = await votingEscrowService.getVotingEscrowsDynamicData({
    network: network.current,
    addresses,
  });
  return { votingEscrowsDynamic };
});

const getUserVotingEscrowsPositions = createAsyncThunk<{ positions: Position[] }, { addresses?: string[] }, ThunkAPI>(
  'votingEscrows/getUserVaultsPositions',
  async ({ addresses }, { extra, getState }) => {
    const { network, wallet } = getState();
    const { votingEscrowService } = extra.services;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const positions = await votingEscrowService.getUserVotingEscrowsPositions({
      network: network.current,
      accountAddress,
      addresses,
    });
    return { positions };
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
  const { votingEscrowService } = extra.services;
  const { network, wallet } = getState();

  const accountAddress = wallet.selectedAddress;
  if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

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
});

/* -------------------------------------------------------------------------- */
/*                             Transaction Methods                            */
/* -------------------------------------------------------------------------- */

const approveLock = createAsyncThunk<TokenAllowance, { tokenAddress: Address; votingEscrowAddress: Address }, ThunkAPI>(
  'votingEscrows/approveLock',
  async ({ tokenAddress, votingEscrowAddress }, { getState, extra, dispatch }) => {
    const { votingEscrowService, transactionService } = extra.services;
    const { wallet, network } = getState();
    const amount = extra.config.MAX_UINT256;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

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
    time: Week;
  },
  ThunkAPI
>(
  'votingEscrows/lock',
  async ({ tokenAddress, votingEscrowAddress, amount, time }, { extra, getState, dispatch }) => {
    const { votingEscrowService, transactionService } = extra.services;
    const { network, wallet, tokens, app } = getState();

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
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

    const notifyEnabled = app.servicesEnabled.notify;
    await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

    dispatch(getVotingEscrowsDynamic({ addresses: [votingEscrowAddress] }));
    dispatch(getUserVotingEscrowsPositions({ addresses: [votingEscrowAddress] }));
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
    const { votingEscrowService, transactionService } = extra.services;
    const { network, wallet, tokens, app } = getState();

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const token = tokens.tokensMap[tokenAddress];
    const tx = await votingEscrowService.increaseLockAmount({
      network: network.current,
      accountAddress,
      tokenAddress,
      votingEscrowAddress,
      amount: toWei(amount, parseInt(token.decimals)),
    });

    const notifyEnabled = app.servicesEnabled.notify;
    await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

    dispatch(getVotingEscrowsDynamic({ addresses: [votingEscrowAddress] }));
    dispatch(getUserVotingEscrowsPositions({ addresses: [votingEscrowAddress] }));
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
    time: Week;
  },
  ThunkAPI
>(
  'votingEscrows/extendLockTime',
  async ({ tokenAddress, votingEscrowAddress, time }, { extra, getState, dispatch }) => {
    const { votingEscrowService, transactionService } = extra.services;
    const { network, wallet, app } = getState();

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const tx = await votingEscrowService.extendLockTime({
      network: network.current,
      accountAddress,
      tokenAddress,
      votingEscrowAddress,
      time,
    });

    const notifyEnabled = app.servicesEnabled.notify;
    await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

    dispatch(getVotingEscrowsDynamic({ addresses: [votingEscrowAddress] }));
    dispatch(getUserVotingEscrowsPositions({ addresses: [votingEscrowAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, votingEscrowAddress] }));
  },
  {
    serializeError: parseError,
  }
);

const withdrawLocked = createAsyncThunk<void, { tokenAddress: Address; votingEscrowAddress: Address }, ThunkAPI>(
  'votingEscrows/withdrawLocked',
  async ({ tokenAddress, votingEscrowAddress }, { extra, getState, dispatch }) => {
    const { votingEscrowService, transactionService } = extra.services;
    const { network, wallet, app } = getState();

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const tx = await votingEscrowService.withdrawLocked({
      network: network.current,
      accountAddress,
      votingEscrowAddress,
    });

    const notifyEnabled = app.servicesEnabled.notify;
    await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

    dispatch(getVotingEscrowsDynamic({ addresses: [votingEscrowAddress] }));
    dispatch(getUserVotingEscrowsPositions({ addresses: [votingEscrowAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, votingEscrowAddress] }));
  },
  {
    serializeError: parseError,
  }
);

const withdrawUnlocked = createAsyncThunk<void, { tokenAddress: Address; votingEscrowAddress: Address }, ThunkAPI>(
  'votingEscrows/withdrawUnlocked',
  async ({ tokenAddress, votingEscrowAddress }, { extra, getState, dispatch }) => {
    const { votingEscrowService, transactionService } = extra.services;
    const { network, wallet, app } = getState();

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const tx = await votingEscrowService.withdrawUnlocked({
      network: network.current,
      accountAddress,
      votingEscrowAddress,
    });

    const notifyEnabled = app.servicesEnabled.notify;
    await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

    dispatch(getVotingEscrowsDynamic({ addresses: [votingEscrowAddress] }));
    dispatch(getUserVotingEscrowsPositions({ addresses: [votingEscrowAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, votingEscrowAddress] }));
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
  getLockAllowance,
  approveLock,
  lock,
  increaseLockAmount,
  extendLockTime,
  withdrawLocked,
  withdrawUnlocked,
};
