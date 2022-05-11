import { createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { WalletActions } from '@store';
import { Theme } from '@types';

const changeTheme = createAsyncThunk<{ theme: Theme }, { theme: Theme }, ThunkAPI>(
  'theme/changeTheme',
  async ({ theme }, { dispatch, getState }) => {
    dispatch(WalletActions.changeWalletTheme(theme));
    //Adding the current theme to the dataset of body, in order to use it with css queries
    document.body.dataset.theme = theme;
    return { theme };
  }
);

export const ThemeActions = {
  changeTheme,
};
