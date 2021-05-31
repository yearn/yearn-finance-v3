import { createAction, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import { IronBankMarket, Position } from '@types';
import { TokensActions } from '@store';

const setSelectedCyTokenAddress = createAction<{ cyTokenAddress: string }>('ironbank/setSelectedCyTokenAddress');

const initiateIronBank = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'ironBank/initiateIronBank',
  async (_arg, { dispatch }) => {
    await dispatch(getIronBankData());
    await dispatch(getCyTokens());
  }
);

const getIronBankData = createAsyncThunk<
  { address: string; borrowLimit: string; borrowLimitUsed: string },
  undefined,
  ThunkAPI
>('ironBank/getIronBankData', async (_arg, { extra, getState }) => {
  const userAddress = getState().wallet.selectedAddress;
  const { ironBankService } = extra.services;
  const { address, borrowLimit, borrowLimitUsed } = await ironBankService.getIronBankData({ userAddress });
  return { address, borrowLimit, borrowLimitUsed };
});

const getCyTokens = createAsyncThunk<{ ironBankMarkets: IronBankMarket[] }, undefined, ThunkAPI>(
  'ironBank/getCyTokens',
  async (_arg, { extra }) => {
    const { ironBankService } = extra.services;
    const ironBankMarkets = await ironBankService.getSupportedCyTokens();

    return { ironBankMarkets };
  }
);

const getUserCyTokens = createAsyncThunk<{ userMarketsData: Position[] }, { marketAddresses?: string[] }, ThunkAPI>(
  'ironBank/getUserCyTokens',
  async ({ marketAddresses }, { extra, getState, dispatch }) => {
    const { ironBankService } = extra.services;
    const userAddress = getState().wallet.selectedAddress;
    if (!userAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }
    const userMarketsData = await ironBankService.getUserCyTokensData({ userAddress, marketAddresses });

    return { userMarketsData };
  }
);

const approveCyToken = createAsyncThunk<void, { cyTokenAddress: string; tokenAddress: string }, ThunkAPI>(
  'ironBank/approve',
  async ({ cyTokenAddress, tokenAddress }, { extra, getState, dispatch }) => {
    try {
      const result = await dispatch(TokensActions.approve({ tokenAddress, spenderAddress: cyTokenAddress }));
      unwrapResult(result);
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

export const IronBankActions = {
  initiateIronBank,
  getCyTokens,
  getIronBankData,
  getUserCyTokens,
  setSelectedCyTokenAddress,
  approveCyToken,
};
