import { createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { walletSelect, getTokens } from '@store';

export const initApp = createAsyncThunk<void, void, ThunkAPI>('app/initApp', async (_arg, { dispatch, getState }) => {
  const { wallet } = getState();

  await dispatch(getTokens());

  if (wallet.name) {
    await dispatch(walletSelect(wallet.name));
  }
});
