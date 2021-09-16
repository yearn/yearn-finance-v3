import { createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { WalletActions } from '@store';
import { Theme } from '@types';

const changeTheme = createAsyncThunk<{ theme: Theme }, { theme: Theme }, ThunkAPI>(
  'theme/changeTheme',
  async ({ theme }, { dispatch, getState }) => {
    dispatch(WalletActions.changeWalletTheme(theme));
    return { theme };
  }
);

export const ThemeActions = {
  changeTheme,
};
