import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { walletSelect } from './wallet';
import { AppState } from '@types';

export const initApp = createAsyncThunk<void, string | undefined, ThunkAPI>(
  'app/initApp',
  async (_arg, { dispatch, getState }) => {
    const { wallet } = getState();

    if (wallet.name) {
      await dispatch(walletSelect(wallet.name));
    }
  }
);

const initialState: AppState = {
  isInitialized: false,
  isLoading: false,
  error: undefined,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initApp.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(initApp.fulfilled, (state) => {
        state.isInitialized = true;
        state.isLoading = false;
      })
      .addCase(initApp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export default appSlice.reducer;
