import { createSelector } from '@reduxjs/toolkit';

import { RootState, Status } from '@types';

const selectAppState = (state: RootState) => state.app;
const selectIsAppInitialized = (state: RootState) => state.app.isInitialized;
const selectServicesEnabled = (state: RootState) => state.app.servicesEnabed;
const selectAppStatusMap = (state: RootState) => state.app.statusMap;

const selectAppStatus = createSelector([selectAppState], (appState): Status => {
  const { isInitialized, statusMap } = appState;
  const { initApp, getAppData, clearAppData, user } = statusMap;
  return {
    loading:
      !isInitialized ||
      initApp.loading ||
      getAppData.loading ||
      clearAppData.loading ||
      user.getUserAppData.loading ||
      user.clearUserAppData.loading,
    error:
      initApp.error ||
      getAppData.error ||
      clearAppData.error ||
      user.getUserAppData.error ||
      user.clearUserAppData.error,
  };
});

export const AppSelectors = {
  selectAppState,
  selectIsAppInitialized,
  selectServicesEnabled,
  selectAppStatusMap,
  selectAppStatus,
};
