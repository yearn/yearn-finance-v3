import { createReducer } from '@reduxjs/toolkit';
import { initialStatus, LabsState, UserLabActionsStatusMap, LabActionsStatusMap } from '@types';
import { LabsActions } from './labs.actions';

export const initialLabActionsStatusMap: LabActionsStatusMap = {
  get: initialStatus,
};

export const initialUserLabsActionsStatusMap: UserLabActionsStatusMap = {
  get: initialStatus,
};

const initialState: LabsState = {
  labsAddresses: [],
  labsMap: {},
  selectedLabAddress: undefined,
  user: {
    userLabsPositionsMap: {},
    labsAllowancesMap: {},
  },
  statusMap: {
    initiateLabs: { loading: false, error: null },
    getLabs: { loading: false, error: null },
    labsActionsStatusMap: {},
    user: {
      getUserLabsPositions: { loading: false, error: null },
      userLabsActionsStatusMap: {},
    },
  },
};

const { initiateLabs } = LabsActions;

const labsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(initiateLabs.pending, (state) => {
      state.statusMap.initiateLabs = { loading: true };
    })
    .addCase(initiateLabs.fulfilled, (state) => {
      state.statusMap.initiateLabs = {};
    })
    .addCase(initiateLabs.rejected, (state, { error }) => {
      state.statusMap.initiateLabs = { error: error.message };
    });
});

export default labsReducer;
