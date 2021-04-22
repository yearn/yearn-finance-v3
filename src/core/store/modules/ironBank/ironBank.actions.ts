import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import { CyTokenData } from '@types';

const initiateIronBank = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'ironBank/initiateIronBank',
  async (_arg, { dispatch }) => {
    // dispatch(getIronBankData());
    await dispatch(getCyTokens());
  }
);

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
};
