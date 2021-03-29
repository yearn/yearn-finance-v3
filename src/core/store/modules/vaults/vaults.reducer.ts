import { createReducer } from '@reduxjs/toolkit';
import { VaultsState } from '@types';
import { getVaults } from './vaults.actions';

const initialState: VaultsState = {
  supported: [],
  isLoading: false,
  error: undefined,
};

const vaultsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getVaults.pending, (state) => {
      state.isLoading = true;
      state.error = undefined;
    })
    .addCase(getVaults.fulfilled, (state, { payload: { supportedVaults } }) => {
      state.supported = supportedVaults;
      state.isLoading = false;
    })
    .addCase(getVaults.rejected, (state, { error }) => {
      state.isLoading = false;
      state.error = error.message;
    });
});

export default vaultsReducer;
