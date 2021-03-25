import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { VaultsState } from '@types';

export const getVaults = createAsyncThunk<any[], string | undefined, ThunkAPI>(
  'vaults/getVaults',
  async (_arg, { extra }) => {
    const { getSupportedVaults } = extra.services;
    const supportedVaults = await getSupportedVaults.execute();
    return supportedVaults;
  }
);

const initialState: VaultsState = {
  supported: [],
  isLoading: false,
  error: undefined,
};

const vaultSlice = createSlice({
  name: 'vaults',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getVaults.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getVaults.fulfilled, (state, action) => {
        state.supported = action.payload;
        state.isLoading = false;
      })
      .addCase(getVaults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export default vaultSlice.reducer;
