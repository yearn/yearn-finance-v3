import { createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { walletSelect, getTokens } from '@store';

export const AppActions = {
  initApp: createAsyncThunk<void, void, ThunkAPI>('app/initApp', async (_arg, { dispatch, getState }) => {
    const { wallet } = getState();
    if (wallet.name) {
      dispatch(walletSelect(wallet.name));
    }
    dispatch(getTokens());
  }),
};
