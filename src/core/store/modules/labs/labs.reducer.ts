import { createReducer } from '@reduxjs/toolkit';
import {
  initialStatus,
  LabsState,
  UserLabActionsStatusMap,
  LabActionsStatusMap,
  Position,
  LabsPositionsMap,
} from '@types';
import { groupBy, keyBy, union } from 'lodash';
import { LabsActions } from './labs.actions';

export const initialLabActionsStatusMap: LabActionsStatusMap = {
  get: initialStatus,
  approveDeposit: initialStatus,
  deposit: initialStatus,
  approveZapOut: initialStatus,
};

export const initialUserLabsActionsStatusMap: UserLabActionsStatusMap = {
  get: initialStatus,
  getPositions: initialStatus,
};

export const labsInitialState: LabsState = {
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

const { initiateLabs, getLabs, getLabsDynamic, getUserLabsPositions, yvBoost } = LabsActions;
const { yvBoostApproveDeposit, yvBoostDeposit, yvBoostApproveZapOut } = yvBoost;

const labsReducer = createReducer(labsInitialState, (builder) => {
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
    })
    .addCase(getLabsDynamic.pending, (state, { meta }) => {
      const labsAddresses = meta.arg.addresses;
      labsAddresses.forEach((address) => {
        state.statusMap.labsActionsStatusMap[address].get = { loading: true };
      });
    })
    .addCase(getLabsDynamic.fulfilled, (state, { meta, payload: { labsDynamicData } }) => {
      const labsAddresses = meta.arg.addresses;
      labsAddresses.forEach((address) => (state.statusMap.labsActionsStatusMap[address].get = {}));

      labsDynamicData.forEach((labDynamicData) => {
        const labAddress = labDynamicData.address;
        state.labsMap[labAddress] = {
          ...state.labsMap[labAddress],
          ...labDynamicData,
        };
      });
    })
    .addCase(getLabsDynamic.rejected, (state, { error, meta }) => {
      const labsAddresses = meta.arg.addresses;
      labsAddresses.forEach((address) => {
        state.statusMap.labsActionsStatusMap[address].get = { error: error.message };
      });
    })
    .addCase(getUserLabsPositions.pending, (state, { meta }) => {
      const labsAddresses = meta.arg.labsAddresses || [];
      labsAddresses.forEach((address) => {
        checkAndInitUserLabStatus(state, address);
        state.statusMap.user.userLabsActionsStatusMap[address].getPositions = { loading: true };
      });
      state.statusMap.user.getUserLabsPositions = { loading: true };
    })
    .addCase(getUserLabsPositions.fulfilled, (state, { meta, payload: { userLabsPositions } }) => {
      const labsPositionsMap = parsePositionsIntoMap(userLabsPositions);
      const labsAddresses = meta.arg.labsAddresses;
      labsAddresses?.forEach((address) => {
        state.statusMap.user.userLabsActionsStatusMap[address].getPositions = {};
      });

      userLabsPositions.forEach((position) => {
        const address = position.assetAddress;
        const allowancesMap: any = {};
        position.assetAllowances.forEach((allowance) => (allowancesMap[allowance.spender] = allowance.amount));

        state.user.labsAllowancesMap[address] = allowancesMap;
      });

      state.user.userLabsPositionsMap = { ...state.user.userLabsPositionsMap, ...labsPositionsMap };
      state.statusMap.user.getUserLabsPositions = {};
    })
    .addCase(getUserLabsPositions.rejected, (state, { meta, error }) => {
      const labsAddresses = meta.arg.labsAddresses || [];
      labsAddresses.forEach((address) => {
        state.statusMap.user.userLabsActionsStatusMap[address].getPositions = {};
      });
      state.statusMap.user.getUserLabsPositions = { error: error.message };
    })
    .addCase(yvBoostApproveDeposit.pending, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].approveDeposit = { loading: true };
    })
    .addCase(yvBoostApproveDeposit.fulfilled, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].approveDeposit = {};
    })
    .addCase(yvBoostApproveDeposit.rejected, (state, { meta, error }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].approveDeposit = { error: error.message };
    })
    .addCase(yvBoostDeposit.pending, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].deposit = { loading: true };
    })
    .addCase(yvBoostDeposit.fulfilled, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].deposit = {};
    })
    .addCase(yvBoostDeposit.rejected, (state, { meta, error }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].deposit = { error: error.message };
    })
    .addCase(yvBoostApproveZapOut.pending, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].approveZapOut = { loading: true };
    })
    .addCase(yvBoostApproveZapOut.fulfilled, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].approveZapOut = {};
    })
    .addCase(yvBoostApproveZapOut.rejected, (state, { meta, error }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].approveZapOut = { error: error.message };
    });
});

function checkAndInitUserLabStatus(state: LabsState, labAddress: string) {
  const actionsMap = state.statusMap.user.userLabsActionsStatusMap[labAddress];
  if (actionsMap) return;
  state.statusMap.user.userLabsActionsStatusMap[labAddress] = { ...initialUserLabsActionsStatusMap };
}

function parsePositionsIntoMap(positions: Position[]): { [labAddress: string]: LabsPositionsMap } {
  const grouped = groupBy(positions, 'assetAddress');
  const labsMap: { [labAddress: string]: any } = {};
  Object.entries(grouped).forEach(([key, value]) => {
    labsMap[key] = keyBy(value, 'typeId');
  });
  return labsMap;
}

export default labsReducer;
