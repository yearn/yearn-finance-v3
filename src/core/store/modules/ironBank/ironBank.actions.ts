import { createAction, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

import { ThunkAPI } from '@frameworks/redux';
import {
  CyTokenUserMetadata,
  EthereumAddress,
  IronBankMarket,
  IronBankMarketDynamic,
  IronBankUserSummary,
  Position,
} from '@types';
import { handleTransaction } from '@utils';
import { TokensActions } from '@store';

const setSelectedMarketAddress = createAction<{ marketAddress: string }>('ironbank/setSelectedMarketAddress');
const clearSelectedMarketAndStatus = createAction<void>('ironBank/clearSelectedMarketAndStatus');
const clearUserData = createAction<void>('ironbank/clearUserData');

const initiateIronBank = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'ironBank/initiateIronBank',
  async (_arg, { dispatch }) => {
    await dispatch(getMarkets());
  }
);

const getIronBankSummary = createAsyncThunk<{ userIronBankSummary: IronBankUserSummary }, undefined, ThunkAPI>(
  'ironBank/getIronBankSummary',
  async (_arg, { extra, getState }) => {
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { ironBankService } = extra.services;
    const userIronBankSummary = await ironBankService.getUserIronBankSummary({ userAddress });
    return { userIronBankSummary };
  }
);

const getMarketsDynamic = createAsyncThunk<
  { marketsDynamicData: IronBankMarketDynamic[] },
  { addresses: string[] },
  ThunkAPI
>('ironBank/getMarketsDynamic', async ({ addresses }, { extra }) => {
  const { ironBankService } = extra.services;
  const marketsDynamicData = await ironBankService.getMarketsDynamicData(addresses);
  return { marketsDynamicData };
});

const getMarkets = createAsyncThunk<{ ironBankMarkets: IronBankMarket[] }, undefined, ThunkAPI>(
  'ironBank/getMarkets',
  async (_arg, { extra }) => {
    const { ironBankService } = extra.services;
    const ironBankMarkets = await ironBankService.getSupportedMarkets();

    return { ironBankMarkets };
  }
);

const getUserMarketsPositions = createAsyncThunk<
  { userMarketsPositions: Position[] },
  { marketAddresses?: string[] },
  ThunkAPI
>('ironBank/getUserMarketsPositions', async ({ marketAddresses }, { extra, getState, dispatch }) => {
  const { ironBankService } = extra.services;
  const userAddress = getState().wallet.selectedAddress;
  if (!userAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  const userMarketsPositions = await ironBankService.getUserMarketsPositions({ userAddress, marketAddresses });

  return { userMarketsPositions };
});

const getUserMarketsMetadata = createAsyncThunk<
  { userMarketsMetadata: CyTokenUserMetadata[] },
  { marketAddresses?: string[] },
  ThunkAPI
>('ironBank/getUserMarketsMetadata', async ({ marketAddresses }, { extra, getState, dispatch }) => {
  const { ironBankService } = extra.services;
  const userAddress = getState().wallet.selectedAddress;
  if (!userAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  const userMarketsMetadata = await ironBankService.getUserMarketsMetadata({ userAddress, marketAddresses });

  return { userMarketsMetadata };
});

const approveMarket = createAsyncThunk<void, { marketAddress: string; tokenAddress: string }, ThunkAPI>(
  'ironBank/approve',
  async ({ marketAddress, tokenAddress }, { extra, getState, dispatch }) => {
    const result = await dispatch(TokensActions.approve({ tokenAddress, spenderAddress: marketAddress }));
    unwrapResult(result);
  }
);

const supplyMarket = createAsyncThunk<void, MarketsActionsProps, ThunkAPI>(
  'ironBank/supply',
  async ({ marketAddress, amount }, { extra, getState, dispatch }) => {
    // NOTE: We will merge every the four main IB actions into one later on an already planned refactor
    const { ironBankService } = extra.services;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }

    const underlyingTokenAddress = getState().ironBank.marketsMap[marketAddress].address;

    // TODO Needed checks for amount

    const tx = await ironBankService.executeTransaction({
      userAddress,
      marketAddress,
      amount: amount.toString(),
      action: 'supply',
    });
    await handleTransaction(tx);
    dispatch(getMarketsDynamic({ addresses: [marketAddress] }));
    dispatch(getIronBankSummary());
    dispatch(getUserMarketsMetadata({ marketAddresses: [marketAddress] }));
    dispatch(getUserMarketsPositions({ marketAddresses: [marketAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [underlyingTokenAddress] }));
  }
);

const borrowMarket = createAsyncThunk<void, MarketsActionsProps, ThunkAPI>(
  'ironBank/borrow',
  async ({ marketAddress, amount }, { extra, getState, dispatch }) => {
    // NOTE: We will merge every the four main IB actions into one later on an already planned refactor
    const { ironBankService } = extra.services;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const underlyingTokenAddress = getState().ironBank.marketsMap[marketAddress].address;

    // TODO Needed checks for amount

    const tx = await ironBankService.executeTransaction({
      userAddress,
      marketAddress,
      amount: amount.toString(),
      action: 'borrow',
    });
    await handleTransaction(tx);
    dispatch(getMarketsDynamic({ addresses: [marketAddress] }));
    dispatch(getIronBankSummary());
    dispatch(getUserMarketsMetadata({ marketAddresses: [marketAddress] }));
    dispatch(getUserMarketsPositions({ marketAddresses: [marketAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [underlyingTokenAddress] }));
  }
);

const withdrawMarket = createAsyncThunk<void, MarketsActionsProps, ThunkAPI>(
  'ironBank/withdraw',
  async ({ marketAddress, amount }, { extra, getState, dispatch }) => {
    // NOTE: We will merge every the four main IB actions into one later on an already planned refactor
    const { ironBankService } = extra.services;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const underlyingTokenAddress = getState().ironBank.marketsMap[marketAddress].address;

    // TODO Needed checks for amount

    const tx = await ironBankService.executeTransaction({
      userAddress,
      marketAddress,
      amount: amount.toString(),
      action: 'withdraw',
    });
    await handleTransaction(tx);
    dispatch(getMarketsDynamic({ addresses: [marketAddress] }));
    dispatch(getIronBankSummary());
    dispatch(getUserMarketsMetadata({ marketAddresses: [marketAddress] }));
    dispatch(getUserMarketsPositions({ marketAddresses: [marketAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [underlyingTokenAddress] }));
  }
);

const repayMarket = createAsyncThunk<void, MarketsActionsProps, ThunkAPI>(
  'ironBank/repay',
  async ({ marketAddress, amount }, { extra, getState, dispatch }) => {
    // NOTE: We will merge every the four main IB actions into one later on an already planned refactor
    const { ironBankService } = extra.services;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const underlyingTokenAddress = getState().ironBank.marketsMap[marketAddress].address;

    // TODO Needed checks for amount

    const tx = await ironBankService.executeTransaction({
      userAddress,
      marketAddress,
      amount: amount.toString(),
      action: 'repay',
    });
    await handleTransaction(tx);
    dispatch(getMarketsDynamic({ addresses: [marketAddress] }));
    dispatch(getIronBankSummary());
    dispatch(getUserMarketsMetadata({ marketAddresses: [marketAddress] }));
    dispatch(getUserMarketsPositions({ marketAddresses: [marketAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [underlyingTokenAddress] }));
  }
);

export interface EnterOrExitMarketProps {
  marketAddress: EthereumAddress;
  actionType: 'enterMarket' | 'exitMarket';
}

const enterOrExitMarket = createAsyncThunk<void, EnterOrExitMarketProps, ThunkAPI>(
  'ironBank/enterOrExitMarket',
  async ({ marketAddress, actionType }, { extra, getState, dispatch }) => {
    const { ironBankService } = extra.services;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }

    // TODO should we double check if user is in markets?

    const tx = await ironBankService.enterOrExitMarket({ marketAddress, userAddress, actionType });
    await handleTransaction(tx);
    dispatch(getIronBankSummary());
    dispatch(getUserMarketsPositions({ marketAddresses: [marketAddress] }));
    dispatch(getUserMarketsMetadata({ marketAddresses: [marketAddress] }));
  }
);

export interface MarketsActionsProps {
  marketAddress: string;
  amount: BigNumber;
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
  repayMarket,
  enterOrExitMarket,
  clearUserData,
  clearSelectedMarketAndStatus,
};
