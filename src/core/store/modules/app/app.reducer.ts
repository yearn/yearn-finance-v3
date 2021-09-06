import { createReducer } from '@reduxjs/toolkit';
import { AppState } from '@types';
import { AppActions } from './app.actions';

export const appInitialState: AppState = {
  isInitialized: false,
  isLoading: false,
  error: undefined,
};

const { initApp } = AppActions;

const appReducer = createReducer(appInitialState, (builder) => {
  builder
    .addCase(initApp.pending, (state) => {
      state.isLoading = true;
      state.error = undefined;
    })
    .addCase(initApp.fulfilled, (state) => {
      state.isInitialized = true;
      state.isLoading = false;
    })
    .addCase(initApp.rejected, (state, { error }) => {
      state.isLoading = false;
      state.error = error.message;
    });
});

export default appReducer;
