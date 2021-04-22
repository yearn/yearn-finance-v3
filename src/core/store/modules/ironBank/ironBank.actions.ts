import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import { CyTokenData, UserCyTokenData, UserTokenData } from '@types';
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

const getUserCyTokens = createAsyncThunk<
  { userCyTokensMap: { [cyTokenAddress: string]: UserCyTokenData } },
  undefined,
  ThunkAPI
>('ironBank/getUserCyTokens', async (_arg, { extra, getState, dispatch }) => {
  const { ironBankService } = extra.services;
  const userAddress = getState().wallet.selectedAddress;
  if (!userAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  const userCyTokens = await ironBankService.getUserCyTokensData({ userAddress });
  const userCyTokensMap: { [address: string]: UserCyTokenData } = {};
  const userTokensMap: { [address: string]: UserTokenData } = {}; // this should be removed when sdk.getTokens() ready.
  userCyTokens.forEach((cyToken) => {
    userCyTokensMap[cyToken.address] = cyToken;
    userTokensMap[cyToken.tokenPosition.address] = cyToken.tokenPosition;
  });

  dispatch(TokensActions.setUserTokensMap({ userTokensMap }));
  return { userCyTokensMap };
});

export const IronBankActions = {
  initiateIronBank,
  getCyTokens,
  getIronBankData,
  getUserCyTokens,
  setSelectedCyTokenAddress,
};
