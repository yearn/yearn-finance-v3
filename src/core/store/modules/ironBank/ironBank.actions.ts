import { createAction, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

import { ThunkAPI } from '@frameworks/redux';
import { AlertsActions, TokensActions } from '@store';
import {
  CyTokenUserMetadata,
  Address,
  IronBankMarket,
  IronBankMarketDynamic,
  IronBankUserSummary,
  Position,
} from '@types';
import { toBN, getNetwork, validateExitMarket, validateNetwork } from '@utils';

const setSelectedMarketAddress = createAction<{ marketAddress: string }>('ironbank/setSelectedMarketAddress');
const clearIronBankData = createAction<void>('ironbank/clearIronBankData');
const clearSelectedMarketAndStatus = createAction<void>('ironBank/clearSelectedMarketAndStatus');
const clearUserData = createAction<void>('ironbank/clearUserData');
const clearMarketStatus = createAction<{ marketAddress: string }>('ironBank/clearMarketStatus');

const initiateIronBank = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'ironBank/initiateIronBank',
  async (_arg, { dispatch }) => {
    await dispatch(getMarkets());
  }
);

const getIronBankSummary = createAsyncThunk<{ userIronBankSummary: IronBankUserSummary }, undefined, ThunkAPI>(
  'ironBank/getIronBankSummary',
  async (_arg, { extra, getState }) => {
    const { wallet, network } = getState();
    const { NETWORK_SETTINGS } = extra.config;
    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    if (!NETWORK_SETTINGS[network.current]?.ironBankEnabled)
      return {
        userIronBankSummary: {
          supplyBalanceUsdc: '0',
          borrowBalanceUsdc: '0',
          borrowLimitUsdc: '0',
          utilizationRatioBips: '0',
        },
      };

    const { ironBankService } = extra.services;
    const userIronBankSummary = await ironBankService.getUserIronBankSummary({ network: network.current, userAddress });
    return { userIronBankSummary };
  }
);

const getMarketsDynamic = createAsyncThunk<
  { marketsDynamicData: IronBankMarketDynamic[] },
  { addresses: string[] },
  ThunkAPI
>('ironBank/getMarketsDynamic', async ({ addresses }, { getState, extra }) => {
  const { network } = getState();
  const { ironBankService } = extra.services;
  const { NETWORK_SETTINGS } = extra.config;

  if (!NETWORK_SETTINGS[network.current].ironBankEnabled) return { marketsDynamicData: [] };

  const marketsDynamicData = await ironBankService.getMarketsDynamicData({
    network: network.current,
    marketAddresses: addresses,
  });
  return { marketsDynamicData };
});

const getMarkets = createAsyncThunk<{ ironBankMarkets: IronBankMarket[] }, undefined, ThunkAPI>(
  'ironBank/getMarkets',
  async (_arg, { getState, extra }) => {
    const { network } = getState();
    const { ironBankService } = extra.services;
    const { NETWORK_SETTINGS } = extra.config;

    if (!NETWORK_SETTINGS[network.current]?.ironBankEnabled) return { ironBankMarkets: [] };

    const ironBankMarkets = await ironBankService.getSupportedMarkets({ network: network.current });

    return { ironBankMarkets };
  }
);

const getUserMarketsPositions = createAsyncThunk<
  { userMarketsPositions: Position[] },
  { marketAddresses?: string[] },
  ThunkAPI
>('ironBank/getUserMarketsPositions', async ({ marketAddresses }, { extra, getState }) => {
  const { network, wallet } = getState();
  const { ironBankService } = extra.services;
  const { NETWORK_SETTINGS } = extra.config;
  const userAddress = wallet.selectedAddress;

  if (!userAddress) throw new Error('WALLET NOT CONNECTED');
  if (!NETWORK_SETTINGS[network.current].ironBankEnabled) return { userMarketsPositions: [] };

  const userMarketsPositions = await ironBankService.getUserMarketsPositions({
    network: network.current,
    userAddress,
    marketAddresses,
  });

  return { userMarketsPositions };
});

const getUserMarketsMetadata = createAsyncThunk<
  { userMarketsMetadata: CyTokenUserMetadata[] },
  { marketAddresses?: string[] },
  ThunkAPI
>('ironBank/getUserMarketsMetadata', async ({ marketAddresses }, { extra, getState }) => {
  const { network, wallet } = getState();
  const { ironBankService } = extra.services;
  const { NETWORK_SETTINGS } = extra.config;
  const userAddress = wallet.selectedAddress;

  if (!userAddress) throw new Error('WALLET NOT CONNECTED');
  if (!NETWORK_SETTINGS[network.current].ironBankEnabled) return { userMarketsMetadata: [] };

  const userMarketsMetadata = await ironBankService.getUserMarketsMetadata({
    network: network.current,
    userAddress,
    marketAddresses,
  });

  return { userMarketsMetadata };
});

const approveMarket = createAsyncThunk<void, { marketAddress: string; tokenAddress: string }, ThunkAPI>(
  'ironBank/approve',
  async ({ marketAddress, tokenAddress }, { dispatch }) => {
    const result = await dispatch(TokensActions.approve({ tokenAddress, spenderAddress: marketAddress }));
    unwrapResult(result);
  }
);

const supplyMarket = createAsyncThunk<void, MarketsActionsProps, ThunkAPI>(
  'ironBank/supply',
  async ({ marketAddress, amount }, { extra, getState, dispatch }) => {
    // NOTE: We will merge every the four main IB actions into one later on an already planned refactor
    const { network, wallet, app } = getState();
    const { ironBankService, transactionService } = extra.services;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const underlyingTokenAddress = getState().ironBank.marketsMap[marketAddress].tokenId;
    const tokenDecimals = getState().tokens.tokensMap[underlyingTokenAddress].decimals;
    const ONE_UNIT = toBN('10').pow(tokenDecimals);

    // TODO Needed checks for amount

    const tx = await ironBankService.executeTransaction({
      network: network.current,
      userAddress,
      marketAddress,
      amount: amount.times(ONE_UNIT).toFixed(0),
      action: 'supply',
    });
    const notifyEnabled = app.servicesEnabled['notify'];
    await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

    dispatch(getMarketsDynamic({ addresses: [marketAddress] }));
    dispatch(getIronBankSummary());
    // dispatch(getUserMarketsMetadata({ marketAddresses: [marketAddress] })); TODO use this when lens fixes are deployed
    dispatch(getUserMarketsMetadata({})); //  TODO remove this when lens fixes are deployed
    dispatch(getUserMarketsPositions({ marketAddresses: [marketAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [underlyingTokenAddress] }));
  }
);

const borrowMarket = createAsyncThunk<void, MarketsActionsProps, ThunkAPI>(
  'ironBank/borrow',
  async ({ marketAddress, amount }, { extra, getState, dispatch }) => {
    // NOTE: We will merge every the four main IB actions into one later on an already planned refactor
    const { network, wallet, app } = getState();
    const { ironBankService, transactionService } = extra.services;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const underlyingTokenAddress = getState().ironBank.marketsMap[marketAddress].tokenId;
    const tokenDecimals = getState().tokens.tokensMap[underlyingTokenAddress].decimals;
    const ONE_UNIT = toBN('10').pow(tokenDecimals);
    // TODO Needed checks for amount

    const tx = await ironBankService.executeTransaction({
      network: network.current,
      userAddress,
      marketAddress,
      amount: amount.times(ONE_UNIT).toFixed(0),
      action: 'borrow',
    });
    const notifyEnabled = app.servicesEnabled['notify'];
    await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

    dispatch(getMarketsDynamic({ addresses: [marketAddress] }));
    dispatch(getIronBankSummary());
    // dispatch(getUserMarketsMetadata({ marketAddresses: [marketAddress] })); TODO use this when lens fixes are deployed
    dispatch(getUserMarketsMetadata({})); //  TODO remove this when lens fixes are deployed
    dispatch(getUserMarketsPositions({ marketAddresses: [marketAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [underlyingTokenAddress] }));
  }
);

const withdrawMarket = createAsyncThunk<void, MarketsActionsProps, ThunkAPI>(
  'ironBank/withdraw',
  async ({ marketAddress, amount }, { extra, getState, dispatch }) => {
    // NOTE: We will merge every the four main IB actions into one later on an already planned refactor
    const { network, wallet, app } = getState();
    const { ironBankService, transactionService } = extra.services;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const underlyingTokenAddress = getState().ironBank.marketsMap[marketAddress].tokenId;
    const tokenDecimals = getState().tokens.tokensMap[underlyingTokenAddress].decimals;
    const ONE_UNIT = toBN('10').pow(tokenDecimals);
    // TODO Needed checks for amount

    const tx = await ironBankService.executeTransaction({
      network: network.current,
      userAddress,
      marketAddress,
      amount: amount.times(ONE_UNIT).toFixed(0),
      action: 'withdraw',
    });
    const notifyEnabled = app.servicesEnabled['notify'];
    await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

    dispatch(getMarketsDynamic({ addresses: [marketAddress] }));
    dispatch(getIronBankSummary());
    // dispatch(getUserMarketsMetadata({ marketAddresses: [marketAddress] })); TODO use this when lens fixes are deployed
    dispatch(getUserMarketsMetadata({})); //  TODO remove this when lens fixes are deployed
    dispatch(getUserMarketsPositions({ marketAddresses: [marketAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [underlyingTokenAddress] }));
  }
);

const withdrawAllMarket = createAsyncThunk<void, WithdrawAllMarketProps, ThunkAPI>(
  'ironBank/withdraw',
  async ({ marketAddress }, { extra, getState, dispatch }) => {
    // NOTE: We will merge every the four main IB actions into one later on an already planned refactor
    const { network, wallet, app } = getState();
    const { ironBankService, transactionService } = extra.services;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const underlyingTokenAddress = getState().ironBank.marketsMap[marketAddress].tokenId;
    // TODO Needed checks for amount

    const tx = await ironBankService.executeTransaction({
      network: network.current,
      userAddress,
      marketAddress,
      amount: extra.config.MAX_UINT256,
      action: 'withdraw',
    });
    const notifyEnabled = app.servicesEnabled['notify'];
    await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

    dispatch(getMarketsDynamic({ addresses: [marketAddress] }));
    dispatch(getIronBankSummary());
    // dispatch(getUserMarketsMetadata({ marketAddresses: [marketAddress] })); TODO use this when lens fixes are deployed
    dispatch(getUserMarketsMetadata({})); //  TODO remove this when lens fixes are deployed
    dispatch(getUserMarketsPositions({ marketAddresses: [marketAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [underlyingTokenAddress] }));
  }
);

const repayMarket = createAsyncThunk<void, MarketsActionsProps, ThunkAPI>(
  'ironBank/repay',
  async ({ marketAddress, amount }, { extra, getState, dispatch }) => {
    // NOTE: We will merge every the four main IB actions into one later on an already planned refactor
    const { network, wallet, app } = getState();
    const { ironBankService, transactionService } = extra.services;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const underlyingTokenAddress = getState().ironBank.marketsMap[marketAddress].tokenId;
    const tokenDecimals = getState().tokens.tokensMap[underlyingTokenAddress].decimals;
    const ONE_UNIT = toBN('10').pow(tokenDecimals);
    // TODO Needed checks for amount

    const tx = await ironBankService.executeTransaction({
      network: network.current,
      userAddress,
      marketAddress,
      amount: amount.times(ONE_UNIT).toFixed(0),
      action: 'repay',
    });
    const notifyEnabled = app.servicesEnabled['notify'];
    await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

    dispatch(getMarketsDynamic({ addresses: [marketAddress] }));
    dispatch(getIronBankSummary());
    // dispatch(getUserMarketsMetadata({ marketAddresses: [marketAddress] })); TODO use this when lens fixes are deployed
    dispatch(getUserMarketsMetadata({})); //  TODO remove this when lens fixes are deployed
    dispatch(getUserMarketsPositions({ marketAddresses: [marketAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [underlyingTokenAddress] }));
  }
);

const repayAllMarket = createAsyncThunk<void, RepayAllMarketProps, ThunkAPI>(
  'ironBank/repay',
  async ({ marketAddress }, { extra, getState, dispatch }) => {
    // NOTE: We will merge every the four main IB actions into one later on an already planned refactor
    const { network, wallet, app } = getState();
    const { ironBankService, transactionService } = extra.services;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    const underlyingTokenAddress = getState().ironBank.marketsMap[marketAddress].tokenId;
    // TODO validation

    const tx = await ironBankService.executeTransaction({
      network: network.current,
      userAddress,
      marketAddress,
      amount: extra.config.MAX_UINT256,
      action: 'repay',
    });
    const notifyEnabled = app.servicesEnabled['notify'];
    await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

    dispatch(getMarketsDynamic({ addresses: [marketAddress] }));
    dispatch(getIronBankSummary());
    // dispatch(getUserMarketsMetadata({ marketAddresses: [marketAddress] })); TODO use this when lens fixes are deployed
    dispatch(getUserMarketsMetadata({})); //  TODO remove this when lens fixes are deployed
    dispatch(getUserMarketsPositions({ marketAddresses: [marketAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [underlyingTokenAddress] }));
  }
);

export interface EnterOrExitMarketProps {
  marketAddress: Address;
  actionType: 'enterMarket' | 'exitMarket';
}

const enterOrExitMarket = createAsyncThunk<void, EnterOrExitMarketProps, ThunkAPI>(
  'ironBank/enterOrExitMarket',
  async ({ marketAddress, actionType }, { extra, getState, dispatch }) => {
    const { network, wallet, app } = getState();
    const { ironBankService, transactionService } = extra.services;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { error: networkError } = validateNetwork({
      currentNetwork: network.current,
      walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    });
    if (networkError) throw networkError;

    if (actionType === 'exitMarket') {
      const ironBankState = getState().ironBank;
      const marketSuppliedUsdc = ironBankState.user.userMarketsMetadataMap[marketAddress].supplyBalanceUsdc;
      const marketCollateralFactor = ironBankState.marketsMap[marketAddress].metadata.collateralFactor;
      const userIronBankSummary = ironBankState.user.userIronBankSummary;

      const { error } = validateExitMarket({
        marketCollateralFactor,
        marketSuppliedUsdc,
        userIronBankSummary,
      });

      if (error) {
        dispatch(AlertsActions.openAlert({ message: error, type: 'error', timeout: 3000 }));
        throw new Error(error);
      }
    }

    const tx = await ironBankService.enterOrExitMarket({
      network: network.current,
      marketAddress,
      userAddress,
      actionType,
    });
    const notifyEnabled = app.servicesEnabled['notify'];
    await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });

    dispatch(getIronBankSummary());
    dispatch(getUserMarketsPositions({ marketAddresses: [marketAddress] }));
    // dispatch(getUserMarketsMetadata({ marketAddresses: [marketAddress] })); TODO use this when lens fixes are deployed
    dispatch(getUserMarketsMetadata({})); //  TODO remove this when lens fixes are deployed
  }
);

export interface MarketsActionsProps {
  marketAddress: string;
  amount: BigNumber;
}

export interface WithdrawAllMarketProps {
  marketAddress: string;
}

export interface RepayAllMarketProps {
  marketAddress: string;
}

export const IronBankActions = {
  initiateIronBank,
  getMarkets,
  getMarketsDynamic,
  getIronBankSummary,
  getUserMarketsPositions,
  getUserMarketsMetadata,
  setSelectedMarketAddress,
  approveMarket,
  supplyMarket,
  borrowMarket,
  withdrawMarket,
  withdrawAllMarket,
  repayMarket,
  repayAllMarket,
  enterOrExitMarket,
  clearIronBankData,
  clearUserData,
  clearSelectedMarketAndStatus,
  clearMarketStatus,
};
