import { createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { WalletActions, TokensActions } from '@store';

export const initApp = createAsyncThunk<void, void, ThunkAPI>('app/initApp', async (_arg, { dispatch, getState }) => {
  const { wallet } = getState();
  if (wallet.name) {
    dispatch(WalletActions.walletSelect(wallet.name));
  }
  dispatch(TokensActions.getTokens());
});

export const AppActions = {
  initApp,
};
