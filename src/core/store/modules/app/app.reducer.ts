import { createReducer } from '@reduxjs/toolkit';
import { AppState } from '@types';
import { AppActions } from './app.actions';

const initialState: AppState = {
  isInitialized: false,
  isLoading: false,
  error: undefined,
};

const appReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(AppActions.initApp.pending, (state) => {
      state.isLoading = true;
      state.error = undefined;
    })
    .addCase(AppActions.initApp.fulfilled, (state) => {
      state.isInitialized = true;
      state.isLoading = false;
    })
    .addCase(AppActions.initApp.rejected, (state, { error }) => {
      state.isLoading = false;
      state.error = error.message;
    });
});

export default appReducer;
