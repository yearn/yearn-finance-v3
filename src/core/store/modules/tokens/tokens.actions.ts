import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import { TokenData, TokenDynamicData, UserTokenData } from '@types';

const setUserTokenData = createAction<{ userTokenData: UserTokenData }>('user/setUserTokenData');
const setUserTokensMap = createAction<{ userTokensMap: { [address: string]: UserTokenData } }>('user/setUserTokenData');

const getTokens = createAsyncThunk<
  { tokensMap: { [address: string]: TokenData }; tokensAddresses: string[] },
  string | undefined,
  ThunkAPI
>('tokens/getTokens', async (_arg, { extra }) => {
  const { tokenService } = extra.services;
  const tokensData: TokenData[] = await tokenService.getSupportedTokens();
  const tokensMap: { [address: string]: TokenData } = {};
  const tokensAddresses: string[] = [];
  tokensData.forEach((token) => {
    tokensMap[token.address] = token;
    tokensAddresses.push(token.address);
  });
  return { tokensMap, tokensAddresses };
});

const getTokensDynamicData = createAsyncThunk<
  { tokensDynamicData: TokenDynamicData[] },
  { addresses: string[] },
  ThunkAPI
>('tokens/getTokens', async ({ addresses }, { extra }) => {
  const { tokenService } = extra.services;
  const tokensDynamicData = await tokenService.getTokensDynamicData(addresses);
  return { tokensDynamicData };
});

export const TokensActions = {
  setUserTokenData,
  getTokens,
  getTokensDynamicData,
  setUserTokensMap,
};
