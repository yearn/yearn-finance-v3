import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@types';

const selectLabsState = (state: RootState) => state.labs;

export const LabsSelectors = {
  selectLabsState,
};
