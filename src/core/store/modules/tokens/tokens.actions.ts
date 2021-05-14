import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import { TokenDynamicData, UserTokenData } from '@types';
import BigNumber from 'bignumber.js';
import { Token } from '@yfi/sdk';

const setUserTokenData = createAction<{ userTokenData: UserTokenData }>('tokens/setUserTokenData');
const setUserTokensMap = createAction<{ userTokensMap: { [address: string]: UserTokenData } }>(
  'tokens/setUserTokensMap'
);

const getTokens = createAsyncThunk<{ tokensData: Token[] }, string | undefined, ThunkAPI>(
  'tokens/getTokens',
  async (_arg, { extra }) => {
    const { tokenService } = extra.services;
    const tokensData: Token[] = await tokenService.getSupportedTokens();
    return { tokensData };
  }
);

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
