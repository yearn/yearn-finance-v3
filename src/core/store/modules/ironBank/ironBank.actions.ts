import { createAction, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import { CyTokenUserMetadata, IronBankMarket, IronBankMarketDynamic, IronBankPosition, Position } from '@types';
import { TokensActions } from '@store';
import BigNumber from 'bignumber.js';

const setSelectedMarketAddress = createAction<{ marketAddress: string }>('ironbank/setSelectedMarketAddress');

const initiateIronBank = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'ironBank/initiateIronBank',
  async (_arg, { dispatch }) => {
    await dispatch(getIronBankData());
    await dispatch(getMarkets());
  }
);

const getIronBankData = createAsyncThunk<{ ironBankData: IronBankPosition }, undefined, ThunkAPI>(
  'ironBank/getIronBankData',
  async (_arg, { extra, getState }) => {
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { ironBankService } = extra.services;
    const ironBankData = await ironBankService.getIronBankData({ userAddress });
    return { ironBankData };
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
    try {
      const result = await dispatch(TokensActions.approve({ tokenAddress, spenderAddress: marketAddress }));
      unwrapResult(result);
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const supplyMarket = createAsyncThunk<void, { marketAddress: string; amount: BigNumber }, ThunkAPI>(
  'ironBank/supply',
  async ({ marketAddress, amount }, { extra, getState, dispatch }) => {
    try {
      const { ironBankService } = extra.services;
      const userAddress = getState().wallet.selectedAddress;
      if (!userAddress) {
        throw new Error('WALLET NOT CONNECTED');
      }

      // TODO Needed checks for amount

      const txResponse = await ironBankService.supply({ userAddress, marketAddress, amount: amount.toString() });
      // await txResponse.wait(1);
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

const borrowMarket = createAsyncThunk<void, { marketAddress: string; amount: BigNumber }, ThunkAPI>(
  'ironBank/borrow',
  async ({ marketAddress, amount }, { extra, getState, dispatch }) => {
    try {
      const { ironBankService } = extra.services;
      const userAddress = getState().wallet.selectedAddress;
      if (!userAddress) {
        throw new Error('WALLET NOT CONNECTED');
      }

      // TODO Needed checks for amount

      const txResponse = await ironBankService.borrow({ userAddress, marketAddress, amount: amount.toString() });
      // await txResponse.wait(1);
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

export const IronBankActions = {
  initiateIronBank,
  getMarkets,
  getMarketsDynamic,
  getIronBankData,
  getUserMarketsPositions,
  getUserMarketsMetadata,
  setSelectedMarketAddress,
  approveMarket,
  supplyMarket,
  borrowMarket,
};
