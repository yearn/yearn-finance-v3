import { createReducer } from '@reduxjs/toolkit';
import { AppState } from '@types';
import { initApp } from './app.actions';

const initialState: AppState = {
  isInitialized: false,
  isLoading: false,
  error: undefined,
};

const appReducer = createReducer(initialState, (builder) => {
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
});

export default appReducer;
