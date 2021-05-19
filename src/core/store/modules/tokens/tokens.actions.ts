import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import { TokenDynamicData, Token, Balance } from '@types';
import BigNumber from 'bignumber.js';

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

const getUserTokens = createAsyncThunk<{ userTokens: Balance[] }, { addresses?: string[] }, ThunkAPI>(
  'tokens/getUserTokens',
  async ({ addresses }, { extra, getState }) => {
    const accountAddress = getState().wallet.selectedAddress;
    if (!accountAddress) {
      throw new Error('WALLET NOT CONNECTED');
    }

    const { tokenService } = extra.services;
    const userTokens = await tokenService.getUserTokensData(accountAddress, addresses);
    return { userTokens };
  }
);

const approve = createAsyncThunk<{ amount: string }, { tokenAddress: string; spenderAddress: string }, ThunkAPI>(
  'tokens/approve',
  async ({ tokenAddress, spenderAddress }, { extra, getState, rejectWithValue }) => {
    // TODO make it possible to receive approve amount and make needed checks.
    const { tokenService } = extra.services;
    const amount = extra.config.MAX_UINT256;
    const allowancesMap = getState().tokens.user.userTokensAllowancesMap[tokenAddress] ?? {};
    const allowance = allowancesMap[spenderAddress] ?? '0';
    const approved = new BigNumber(allowance).gt(0);
    if (approved) {
      return rejectWithValue('ALREADY_APPROVED');
    }

    await tokenService.approve({ tokenAddress, spenderAddress, amount });

    return { amount };
  }
);

export const TokensActions = {
  getTokens,
  getTokensDynamicData,
  getUserTokens,
  approve,
};
