import { createReducer } from '@reduxjs/toolkit';
import { initialStatus, LabsState, UserLabActionsStatusMap, LabActionsStatusMap } from '@types';
import { union } from 'lodash';
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

const { initiateLabs, getLabs } = LabsActions;

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
    })
    .addCase(getLabs.pending, (state) => {
      state.statusMap.getLabs = { loading: true };
    })
    .addCase(getLabs.fulfilled, (state, { payload: { labsData } }) => {
      const labsAddresses: string[] = [];
      labsData.forEach((lab) => {
        labsAddresses.push(lab.address);
        state.labsMap[lab.address] = lab;
        state.statusMap.labsActionsStatusMap[lab.address] = initialLabActionsStatusMap;
        state.statusMap.user.userLabsActionsStatusMap[lab.address] = initialUserLabsActionsStatusMap;
      });
      state.labsAddresses = union(state.labsAddresses, labsAddresses);
      state.statusMap.getLabs = {};
    })
    .addCase(getLabs.rejected, (state, { error }) => {
      state.statusMap.getLabs = { error: error.message };
    });
});

export default labsReducer;
