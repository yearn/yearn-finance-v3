import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import { TokenData, TokenDynamicData, UserTokenData } from '@types';
import BigNumber from 'bignumber.js';

const setUserTokenData = createAction<{ userTokenData: UserTokenData }>('user/setUserTokenData');
const setUserTokensMap = createAction<{ userTokensMap: { [address: string]: UserTokenData } }>('user/setUserTokensMap');

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
>('tokens/getTokensDynamic', async ({ addresses }, { extra }) => {
  const { tokenService } = extra.services;
  const tokensDynamicData = await tokenService.getTokensDynamicData(addresses);
  return { tokensDynamicData };
});

const approve = createAsyncThunk<{ amount: string }, { tokenAddress: string; spenderAddress: string }, ThunkAPI>(
  'tokens/approve',
  async ({ tokenAddress, spenderAddress }, { extra, getState, rejectWithValue }) => {
    const { tokenService } = extra.services;
    const amount = extra.config.MAX_UINT256;
    const userTokenData = getState().tokens.user.userTokensMap[tokenAddress];
    const approved = new BigNumber(userTokenData.allowancesMap[spenderAddress]).gt(0);
    if (approved) {
      return rejectWithValue('ALREADY_APPROVED');
    }

    await tokenService.approve({ tokenAddress, spenderAddress, amount });

    return { amount };
  }
);

export const TokensActions = {
  setUserTokenData,
  getTokens,
  getTokensDynamicData,
  setUserTokensMap,
  approve,
};
