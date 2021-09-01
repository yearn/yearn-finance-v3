import { createSelector } from '@reduxjs/toolkit';

import { RootState, Status } from '@types';

const selectAppState = (state: RootState) => state.app;
const selectIsAppInitialized = (state: RootState) => state.app.isInitialized;

const selectAppStatus = createSelector([selectAppState], (appStatus): Status => {
  const { isInitialized, isLoading, error } = appStatus;
  return {
    loading: !isInitialized || isLoading,
    error,
  };
});

export const AppSelectors = {
  selectAppState,
  selectIsAppInitialized,
  selectAppStatus,
};
