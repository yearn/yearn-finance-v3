import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import { TokenDynamicData, Token, Balance, Integer } from '@types';

const setSelectedTokenAddress = createAction<{ tokenAddress?: string }>('tokens/setSelectedTokenAddress');
const clearUserTokenState = createAction<void>('tokens/clearUserTokenState');

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

const getTokenAllowance = createAsyncThunk<
  { allowance: Integer },
  { tokenAddress: string; spenderAddress: string },
  ThunkAPI
>('tokens/getTokenAllowance', async ({ tokenAddress, spenderAddress }, { extra, getState }) => {
  const accountAddress = getState().wallet.selectedAddress;
  if (!accountAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }

  const { tokenService } = extra.services;
  const allowance = await tokenService.getTokenAllowance(accountAddress, tokenAddress, spenderAddress);
  return { allowance };
});

const approve = createAsyncThunk<
  { amount: string },
  { tokenAddress: string; spenderAddress: string; amountToApprove?: string },
  ThunkAPI
>('tokens/approve', async ({ tokenAddress, spenderAddress, amountToApprove }, { extra, getState, rejectWithValue }) => {
  const { tokenService } = extra.services;
  const amount = amountToApprove ?? extra.config.MAX_UINT256;
  const accountAddress = getState().wallet.selectedAddress;
  if (!accountAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  await tokenService.approve({ accountAddress, tokenAddress, spenderAddress, amount });

  return { amount };
});

const initSubscriptions = createAsyncThunk<void, void, ThunkAPI>(
  'tokens/initSubscriptions',
  async (_arg, { extra, dispatch }) => {
    const { subscriptionService } = extra.services;
    subscriptionService.subscribe({
      module: 'tokens',
      event: 'priceUsdc',
      action: (tokenAddresses: string[]) => {
        dispatch(getTokensDynamicData({ addresses: tokenAddresses }));
      },
    });
    subscriptionService.subscribe({
      module: 'tokens',
      event: 'balances',
      action: (tokenAddresses: string[]) => {
        dispatch(getUserTokens({ addresses: tokenAddresses }));
      },
    });
    subscriptionService.subscribe({
      module: 'tokens',
      event: 'getAllowance',
      action: (tokenAddress: string, spenderAddress: string) => {
        dispatch(getTokenAllowance({ tokenAddress, spenderAddress }));
      },
    });
  }
);

export const TokensActions = {
  setSelectedTokenAddress,
  getTokens,
  getTokensDynamicData,
  getUserTokens,
  getTokenAllowance,
  approve,
  initSubscriptions,
  clearUserTokenState,
};
