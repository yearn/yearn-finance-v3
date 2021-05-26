import { createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { WalletActions, TokensActions } from '@store';
import { VaultsActions } from '../vaults/vaults.actions';

const initApp = createAsyncThunk<void, void, ThunkAPI>('app/initApp', async (_arg, { dispatch, getState }) => {
  const { wallet } = getState();
  if (wallet.name) {
    dispatch(WalletActions.walletSelect(wallet.name));
  }
  dispatch(TokensActions.getTokens());
  dispatch(initSubscriptions());
});

const initSubscriptions = createAsyncThunk<void, void, ThunkAPI>(
  'app/initSubscriptions',
  async (_arg, { dispatch }) => {
    dispatch(TokensActions.initSubscriptions());
    dispatch(VaultsActions.initSubscriptions());
  }
);

export const AppActions = {
  initApp,
  initSubscriptions,
};
