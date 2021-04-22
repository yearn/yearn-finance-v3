import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import { CyTokenData } from '@types';

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

// todo move this
interface CyTokensMap {
  [cyTokenAddress: string]: CyTokenData;
}

const getCyTokens = createAsyncThunk<{ cyTokensMap: CyTokensMap; cyTokensAddresses: string[] }, undefined, ThunkAPI>(
  'ironBank/getCyTokens',
  async (_arg, { extra }) => {
    const { ironBankService } = extra.services;
    const cyTokens = await ironBankService.getSupportedCyTokens();
    const cyTokensMap: { [cyTokenAddress: string]: CyTokenData } = {};
    const cyTokensAddresses: string[] = [];
    cyTokens.forEach((cyToken) => {
      cyTokensMap[cyToken.address] = cyToken;
      cyTokensAddresses.push(cyToken.address);
    });

    return { cyTokensMap, cyTokensAddresses };
  }
);

export const IronBankActions = {
  initiateIronBank,
  getCyTokens,
  getIronBankData,
};
