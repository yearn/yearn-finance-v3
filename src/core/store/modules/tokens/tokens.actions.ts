import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '../../../frameworks/redux';
import { TokenData } from '@types';

export const getTokens = createAsyncThunk<
  { tokensMap: { [address: string]: TokenData }; tokensAddresses: string[] },
  string | undefined,
  ThunkAPI
>('tokens/getTokens', async (_arg, { extra }) => {
  const { getSupportedTokens } = extra.services;
  const tokensData: TokenData[] = await getSupportedTokens.execute();
  const tokensMap: { [address: string]: TokenData } = {};
  const tokensAddresses: string[] = [];
  tokensData.forEach((token) => {
    tokensMap[token.address] = token;
    tokensAddresses.push(token.address);
  });
  return { tokensMap, tokensAddresses };
});
