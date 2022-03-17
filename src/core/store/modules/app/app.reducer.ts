import { createReducer } from '@reduxjs/toolkit';

import { AppState, initialStatus } from '@types';

import { AppActions } from './app.actions';

export const appInitialState: AppState = {
  isInitialized: false,
  servicesEnabed: {
    zapper: true,
    tenderly: true,
    notify: true,
  },
  statusMap: {
    initApp: initialStatus,
    getAppData: initialStatus,
    clearAppData: initialStatus,
    user: {
      getUserAppData: initialStatus,
      clearUserAppData: initialStatus,
    },
  },
};

const { initApp, getAppData, getUserAppData, clearAppData, clearUserAppData, disableService } = AppActions;

const appReducer = createReducer(appInitialState, (builder) => {
  builder

    /* -------------------------------------------------------------------------- */
    /*                                   Setters                                  */
    /* -------------------------------------------------------------------------- */

    /* ----------------------------- disableService ----------------------------- */
    .addCase(disableService, (state, { payload: { service } }) => {
      state.servicesEnabed[service] = false;
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Clear State                                */
    /* -------------------------------------------------------------------------- */

    /* ------------------------------ clearAppData ------------------------------ */
    .addCase(clearAppData.pending, (state) => {
      state.statusMap.clearAppData = {
        loading: true,
      };
    })
    .addCase(clearAppData.fulfilled, (state) => {
      state.statusMap.clearAppData = initialStatus;
    })
    .addCase(clearAppData.rejected, (state, { error }) => {
      state.statusMap.clearAppData = {
        loading: false,
        error: error.message,
      };
    })

    /* ---------------------------- clearUserAppData ---------------------------- */
    .addCase(clearUserAppData.pending, (state) => {
      state.statusMap.user.clearUserAppData = {
        loading: true,
      };
    })
    .addCase(clearUserAppData.fulfilled, (state) => {
      state.statusMap.user.clearUserAppData = initialStatus;
    })
    .addCase(clearUserAppData.rejected, (state, { error }) => {
      state.statusMap.user.clearUserAppData = {
        loading: false,
        error: error.message,
      };
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Fetch Data                                 */
    /* -------------------------------------------------------------------------- */

    /* --------------------------------- initApp -------------------------------- */
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

    /* ------------------------------- getAppData ------------------------------- */
    .addCase(getAppData.pending, (state, { meta }) => {
      state.statusMap.getAppData = {
        loading: true,
        callArgs: meta.arg,
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
    .addCase(getUserAppData.pending, (state, { meta }) => {
      state.statusMap.user.getUserAppData = {
        loading: true,
        callArgs: meta.arg,
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
