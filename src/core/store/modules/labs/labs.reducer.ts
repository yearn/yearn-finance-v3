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
import { getConstants } from '../../../../config/constants';
import { LabsActions } from './labs.actions';

export const initialLabActionsStatusMap: LabActionsStatusMap = {
  get: initialStatus,
  approveDeposit: initialStatus,
  deposit: initialStatus,
  approveWithdraw: initialStatus,
  withdraw: initialStatus,
  claimReward: initialStatus,
  approveReinvest: initialStatus,
  reinvest: initialStatus,
  approveInvest: initialStatus,
  invest: initialStatus,
  approveStake: initialStatus,
  stake: initialStatus,
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

const {
  initiateLabs,
  getLabs,
  getLabsDynamic,
  getUserLabsPositions,
  setSelectedLabAddress,
  approveDeposit,
  deposit,
  approveWithdraw,
  withdraw,
  yvBoost,
  yveCrv,
  yvBoostEth,
  clearSelectedLabAndStatus,
  clearLabStatus,
  clearUserData,
} = LabsActions;
const { yvBoostApproveDeposit, yvBoostDeposit, yvBoostApproveZapOut, yvBoostWithdraw } = yvBoost;
const { yveCrvApproveDeposit, yveCrvDeposit, yveCrvClaimReward, yveCrvApproveReinvest, yveCrvReinvest } = yveCrv;
const { yvBoostEthApproveInvest, yvBoostEthInvest, yvBoostEthApproveStake, yvBoostEthStake } = yvBoostEth;

const { YVECRV, PSLPYVBOOSTETH } = getConstants().CONTRACT_ADDRESSES;

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
    .addCase(setSelectedLabAddress, (state, { payload: { labAddress } }) => {
      state.selectedLabAddress = labAddress;
    })
    ////// GENERAL //////
    .addCase(approveDeposit.pending, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].approveDeposit = { loading: true };
    })
    .addCase(approveDeposit.fulfilled, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].approveDeposit = {};
    })
    .addCase(approveDeposit.rejected, (state, { meta, error }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].approveDeposit = { error: error.message };
    })
    .addCase(deposit.pending, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].deposit = { loading: true };
    })
    .addCase(deposit.fulfilled, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].deposit = {};
    })
    .addCase(deposit.rejected, (state, { meta, error }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].deposit = { error: error.message };
    })
    .addCase(approveWithdraw.pending, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].approveWithdraw = { loading: true };
    })
    .addCase(approveWithdraw.fulfilled, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].approveWithdraw = {};
    })
    .addCase(approveWithdraw.rejected, (state, { meta, error }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].approveWithdraw = { error: error.message };
    })
    .addCase(withdraw.pending, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].withdraw = { loading: true };
    })
    .addCase(withdraw.fulfilled, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].withdraw = {};
    })
    .addCase(withdraw.rejected, (state, { meta, error }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].withdraw = { error: error.message };
    })

    ////// yvBoost //////
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
      state.statusMap.labsActionsStatusMap[labAddress].approveWithdraw = { loading: true };
    })
    .addCase(yvBoostApproveZapOut.fulfilled, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].approveWithdraw = {};
    })
    .addCase(yvBoostApproveZapOut.rejected, (state, { meta, error }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].approveWithdraw = { error: error.message };
    })
    .addCase(yvBoostWithdraw.pending, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].withdraw = { loading: true };
    })
    .addCase(yvBoostWithdraw.fulfilled, (state, { meta }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].withdraw = {};
    })
    .addCase(yvBoostWithdraw.rejected, (state, { meta, error }) => {
      const labAddress = meta.arg.labAddress;
      state.statusMap.labsActionsStatusMap[labAddress].withdraw = { error: error.message };
    })

    ////// yveCrv //////
    .addCase(yveCrvApproveDeposit.pending, (state, { meta }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[YVECRV].approveDeposit = { loading: true };
    })
    .addCase(yveCrvApproveDeposit.fulfilled, (state, { meta }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[YVECRV].approveDeposit = {};
    })
    .addCase(yveCrvApproveDeposit.rejected, (state, { meta, error }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[YVECRV].approveDeposit = { error: error.message };
    })
    .addCase(yveCrvDeposit.pending, (state, { meta }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[YVECRV].deposit = { loading: true };
    })
    .addCase(yveCrvDeposit.fulfilled, (state, { meta }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[YVECRV].deposit = {};
    })
    .addCase(yveCrvDeposit.rejected, (state, { meta, error }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[YVECRV].deposit = { error: error.message };
    })
    .addCase(yveCrvClaimReward.pending, (state) => {
      state.statusMap.labsActionsStatusMap[YVECRV].claimReward = { loading: true };
    })
    .addCase(yveCrvClaimReward.fulfilled, (state) => {
      state.statusMap.labsActionsStatusMap[YVECRV].claimReward = {};
    })
    .addCase(yveCrvClaimReward.rejected, (state, { error }) => {
      state.statusMap.labsActionsStatusMap[YVECRV].claimReward = { error: error.message };
    })
    .addCase(yveCrvApproveReinvest.pending, (state, { meta }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[YVECRV].approveReinvest = { loading: true };
    })
    .addCase(yveCrvApproveReinvest.fulfilled, (state, { meta }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[YVECRV].approveReinvest = {};
    })
    .addCase(yveCrvApproveReinvest.rejected, (state, { meta, error }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[YVECRV].approveReinvest = { error: error.message };
    })
    .addCase(yveCrvReinvest.pending, (state) => {
      state.statusMap.labsActionsStatusMap[YVECRV].reinvest = { loading: true };
    })
    .addCase(yveCrvReinvest.fulfilled, (state) => {
      state.statusMap.labsActionsStatusMap[YVECRV].reinvest = {};
    })
    .addCase(yveCrvReinvest.rejected, (state, { error }) => {
      state.statusMap.labsActionsStatusMap[YVECRV].reinvest = { error: error.message };
    })

    ////// yveCrv //////
    .addCase(yvBoostEthApproveInvest.pending, (state, { meta }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[PSLPYVBOOSTETH].approveInvest = { loading: true };
    })
    .addCase(yvBoostEthApproveInvest.fulfilled, (state, { meta }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[PSLPYVBOOSTETH].approveInvest = {};
    })
    .addCase(yvBoostEthApproveInvest.rejected, (state, { meta, error }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[PSLPYVBOOSTETH].approveInvest = { error: error.message };
    })
    .addCase(yvBoostEthInvest.pending, (state, { meta }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[PSLPYVBOOSTETH].invest = { loading: true };
    })
    .addCase(yvBoostEthInvest.fulfilled, (state, { meta }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[PSLPYVBOOSTETH].invest = {};
    })
    .addCase(yvBoostEthInvest.rejected, (state, { meta, error }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[PSLPYVBOOSTETH].invest = { error: error.message };
    })
    .addCase(yvBoostEthApproveStake.pending, (state, { meta }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[PSLPYVBOOSTETH].approveStake = { loading: true };
    })
    .addCase(yvBoostEthApproveStake.fulfilled, (state, { meta }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[PSLPYVBOOSTETH].approveStake = {};
    })
    .addCase(yvBoostEthApproveStake.rejected, (state, { meta, error }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[PSLPYVBOOSTETH].approveStake = { error: error.message };
    })
    .addCase(yvBoostEthStake.pending, (state, { meta }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[PSLPYVBOOSTETH].stake = { loading: true };
    })
    .addCase(yvBoostEthStake.fulfilled, (state, { meta }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[PSLPYVBOOSTETH].stake = {};
    })
    .addCase(yvBoostEthStake.rejected, (state, { meta, error }) => {
      // const { labAddress } = meta.arg;
      state.statusMap.labsActionsStatusMap[PSLPYVBOOSTETH].stake = { error: error.message };
    })
    .addCase(clearSelectedLabAndStatus, (state) => {
      if (!state.selectedLabAddress) return;
      const currentAddress = state.selectedLabAddress;
      state.statusMap.labsActionsStatusMap[currentAddress] = initialLabActionsStatusMap;
      state.selectedLabAddress = undefined;
    })
    .addCase(clearUserData, (state) => {
      state.user.labsAllowancesMap = {};
      state.user.userLabsPositionsMap = {};
    })
    .addCase(clearLabStatus, (state, { payload: { labAddress } }) => {
      state.statusMap.labsActionsStatusMap[labAddress] = initialLabActionsStatusMap;
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
