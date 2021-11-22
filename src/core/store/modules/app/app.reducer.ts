import { createReducer } from '@reduxjs/toolkit';

import { AppState, initialStatus } from '@types';

import { AppActions } from './app.actions';

export const appInitialState: AppState = {
  isInitialized: false,
  statusMap: {
    initApp: initialStatus,
    getAppData: initialStatus,
    user: {
      getUserAppData: initialStatus,
    },
  },
};

const { initApp, getAppData, getUserAppData } = AppActions;

const appReducer = createReducer(appInitialState, (builder) => {
  builder
    .addCase(initApp.pending, (state) => {
      state.statusMap.initApp = {
        loading: true,
      };
    })
    .addCase(initApp.fulfilled, (state) => {
      state.isInitialized = true;
      state.statusMap.initApp = initialStatus;
    })
    .addCase(initApp.rejected, (state, { error }) => {
      state.statusMap.initApp = {
        loading: false,
        error: error.message,
      };
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Fetch Data                                 */
    /* -------------------------------------------------------------------------- */

    /* ------------------------------- getAppData ------------------------------- */
    .addCase(getAppData.pending, (state) => {
      state.statusMap.getAppData = {
        loading: true,
      };
    })
    .addCase(getAppData.fulfilled, (state) => {
      state.statusMap.getAppData = initialStatus;
    })
    .addCase(getAppData.rejected, (state, { error }) => {
      state.statusMap.getAppData = {
        loading: false,
        error: error.message,
      };
    })

    /* ----------------------------- getUserAppData ----------------------------- */
    .addCase(getUserAppData.pending, (state) => {
      state.statusMap.user.getUserAppData = {
        loading: true,
      };
    })
    .addCase(getUserAppData.fulfilled, (state) => {
      state.statusMap.user.getUserAppData = initialStatus;
    })
    .addCase(getUserAppData.rejected, (state, { error }) => {
      state.statusMap.user.getUserAppData = {
        loading: false,
        error: error.message,
      };
    });
});

export default appReducer;
