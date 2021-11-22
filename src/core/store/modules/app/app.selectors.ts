import { createSelector } from '@reduxjs/toolkit';

import { RootState, Status } from '@types';

const selectAppState = (state: RootState) => state.app;
const selectIsAppInitialized = (state: RootState) => state.app.isInitialized;
const selectAppStatusMap = (state: RootState) => state.app.statusMap;

const selectAppStatus = createSelector([selectAppState], (appState): Status => {
  const { isInitialized, statusMap } = appState;
  const { initApp, getAppData } = statusMap;
  return {
    loading: !isInitialized || initApp.loading || getAppData.loading,
    error: initApp.error || getAppData.error,
  };
});

export const AppSelectors = {
  selectAppState,
  selectIsAppInitialized,
  selectAppStatusMap,
  selectAppStatus,
};
