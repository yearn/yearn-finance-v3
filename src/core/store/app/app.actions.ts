import { createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '../../frameworks/redux';
import { walletSelect } from '@store';

export const initApp = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'app/initApp',
  async (_arg, { dispatch, getState }) => {
    const { wallet } = getState();

    if (wallet.name) {
      await dispatch(walletSelect(wallet.name));
    }
  }
);
