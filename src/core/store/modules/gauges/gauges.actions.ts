import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { Address, Position, TokenAllowance, Unit, Gauge, GaugeDynamic } from '@types';
import { getNetwork, validateNetwork, parseError, toWei } from '@utils';

import { TokensActions } from '../tokens/tokens.actions';

/* -------------------------------------------------------------------------- */
/*                                   Setters                                  */
/* -------------------------------------------------------------------------- */

const setSelectedGaugeAddress = createAction<{ gaugeAddress?: string }>('gauges/setSelectedGaugeAddress');

/* -------------------------------------------------------------------------- */
/*                                 Clear State                                */
/* -------------------------------------------------------------------------- */

const clearGaugesData = createAction<void>('gauges/clearGaugesData');
const clearUserData = createAction<void>('gauges/clearUserData');
const clearSelectedGaugeAndStatus = createAction<void>('gauges/clearSelectedGaugeAndStatus');
const clearGaugeStatus = createAction<{ gaugeAddress: string }>('gauges/clearGaugeStatus');

/* -------------------------------------------------------------------------- */
/*                                 Fetch Data                                 */
/* -------------------------------------------------------------------------- */

const initiateGauges = createAsyncThunk<void, void, ThunkAPI>('gauges/initiateGauges', async (_arg, { dispatch }) => {
  await dispatch(getGauges({}));
});

const getGauges = createAsyncThunk<{ gauges: Gauge[] }, { addresses?: Address[] }, ThunkAPI>(
  'gauges/getGauges',
  async ({ addresses }, { getState, extra }) => {
    const { network } = getState();
    const { gaugeService } = extra.services;
    const gauges = await gaugeService.getSupportedGauges({ network: network.current, addresses });
    return { gauges };
  }
);

const getGaugesDynamic = createAsyncThunk<{ gaugesDynamic: GaugeDynamic[] }, { addresses: Address[] }, ThunkAPI>(
  'gauges/getGaugesDynamic',
  async ({ addresses }, { getState, extra }) => {
    const { network } = getState();
    const { gaugeService } = extra.services;
    const gaugesDynamic = await gaugeService.getGaugesDynamicData({
      network: network.current,
      addresses,
    });
    return { gaugesDynamic };
  }
);

const getUserGaugesPositions = createAsyncThunk<
  { userGaugesPositions: Position[] },
  { addresses?: string[] },
  ThunkAPI
>('gauges/getUserVaultsPositions', async ({ addresses }, { extra, getState }) => {
  const { network, wallet } = getState();
  const { gaugeService } = extra.services;

  const accountAddress = wallet.selectedAddress;
  if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

  const userGaugesPositions = await gaugeService.getUserGaugesPositions({
    network: network.current,
    accountAddress,
    addresses,
  });
  return { userGaugesPositions };
});

const getStakeAllowance = createAsyncThunk<
  TokenAllowance,
  {
    tokenAddress: Address;
    gaugeAddress: Address;
  },
  ThunkAPI
>('gauges/getStakeAllowance', async ({ tokenAddress, gaugeAddress }, { extra, getState, dispatch }) => {
  const { gaugeService } = extra.services;
  const { network, wallet } = getState();

  const accountAddress = wallet.selectedAddress;
  if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

  const tokenAllowance = await gaugeService.getStakeAllowance({
    network: network.current,
    accountAddress,
    tokenAddress,
    gaugeAddress,
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

const approveStake = createAsyncThunk<TokenAllowance, { tokenAddress: Address; gaugeAddress: Address }, ThunkAPI>(
  'gauges/approveStake',
  async ({ tokenAddress, gaugeAddress }, { getState, extra, dispatch }) => {
    const { gaugeService, transactionService } = extra.services;
    const { wallet, network } = getState();
    const amount = extra.config.MAX_UINT256;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const tx = await gaugeService.approveStake({
      network: network.current,
      accountAddress,
      tokenAddress,
      gaugeAddress,
      amount,
    });

    await transactionService.handleTransaction({ tx, network: network.current });

    const tokenAllowance = await gaugeService.getStakeAllowance({
      network: network.current,
      accountAddress,
      tokenAddress,
      gaugeAddress,
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

const stake = createAsyncThunk<
  void,
  {
    tokenAddress: Address;
    gaugeAddress: Address;
    amount: Unit;
  },
  ThunkAPI
>(
  'gauges/stake',
  async ({ tokenAddress, gaugeAddress, amount }, { extra, getState, dispatch }) => {
    const { gaugeService, transactionService } = extra.services;
    const { network, wallet, tokens, app } = getState();

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const token = tokens.tokensMap[tokenAddress];
    const tx = await gaugeService.stake({
      network: network.current,
      accountAddress,
      tokenAddress,
      gaugeAddress,
      amount: toWei(amount, parseInt(token.decimals)),
    });

    const notifyEnabled = app.servicesEnabled.notify;
    await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

    dispatch(getGaugesDynamic({ addresses: [gaugeAddress] }));
    dispatch(getUserGaugesPositions({ addresses: [gaugeAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, gaugeAddress] }));
  },
  {
    serializeError: parseError,
  }
);

const unstake = createAsyncThunk<void, { tokenAddress: Address; gaugeAddress: Address }, ThunkAPI>(
  'gauges/unstake',
  async ({ tokenAddress, gaugeAddress }, { extra, getState, dispatch }) => {
    const { gaugeService, transactionService } = extra.services;
    const { network, wallet, app } = getState();

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const tx = await gaugeService.unstake({
      network: network.current,
      accountAddress,
      gaugeAddress,
    });

    const notifyEnabled = app.servicesEnabled.notify;
    await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

    dispatch(getGaugesDynamic({ addresses: [gaugeAddress] }));
    dispatch(getUserGaugesPositions({ addresses: [gaugeAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, gaugeAddress] }));
  },
  {
    serializeError: parseError,
  }
);

const claimRewards = createAsyncThunk<void, { tokenAddress: Address; gaugeAddress: Address }, ThunkAPI>(
  'gauges/claimRewards',
  async ({ tokenAddress, gaugeAddress }, { extra, getState, dispatch }) => {
    const { gaugeService, transactionService } = extra.services;
    const { network, wallet, app } = getState();

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const tx = await gaugeService.claimRewards({
      network: network.current,
      accountAddress,
      gaugeAddress,
    });

    const notifyEnabled = app.servicesEnabled.notify;
    await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

    dispatch(getGaugesDynamic({ addresses: [gaugeAddress] }));
    dispatch(getUserGaugesPositions({ addresses: [gaugeAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, gaugeAddress] }));
  },
  {
    serializeError: parseError,
  }
);

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export const GaugesActions = {
  setSelectedGaugeAddress,
  clearGaugesData,
  clearUserData,
  clearSelectedGaugeAndStatus,
  clearGaugeStatus,
  initiateGauges,
  getGauges,
  getGaugesDynamic,
  getUserGaugesPositions,
  getStakeAllowance,
  approveStake,
  stake,
  unstake,
  claimRewards,
};
