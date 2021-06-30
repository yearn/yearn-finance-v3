import { groupBy, keyBy, union } from 'lodash';

import { createReducer } from '@reduxjs/toolkit';
import {
  initialStatus,
  VaultsState,
  VaultPositionsMap,
  Position,
  UserVaultActionsStatusMap,
  VaultActionsStatusMap,
  VaultTransaction,
} from '@types';
import { VaultsActions } from './vaults.actions';

export const initialVaultActionsStatusMap: VaultActionsStatusMap = {
  approve: initialStatus,
  deposit: initialStatus,
  withdraw: initialStatus,
  approveZapOut: initialStatus,
  get: initialStatus,
};

export const initialUserVaultsActionsStatusMap: UserVaultActionsStatusMap = {
  getPosition: initialStatus,
};

export const initialTransaction: VaultTransaction = {
  expectedOutcome: undefined,
};

export const vaultsInitialState: VaultsState = {
  vaultsAddresses: [],
  vaultsMap: {},
  selectedVaultAddress: undefined,
  transaction: initialTransaction,
  user: {
    userVaultsSummary: undefined,
    userVaultsPositionsMap: {},
    userVaultsMetadataMap: {},
    vaultsAllowancesMap: {},
  },
  statusMap: {
    initiateSaveVaults: initialStatus,
    getVaults: initialStatus,
    vaultsActionsStatusMap: {},
    getExpectedTransactionOutcome: initialStatus,
    user: {
      getUserVaultsSumary: initialStatus,
      getUserVaultsPositions: initialStatus,
      userVaultsActionsStatusMap: {},
    },
  },
};

const {
  approveDeposit,
  approveZapOut,
  depositVault,
  getVaults,
  initiateSaveVaults,
  setSelectedVaultAddress,
  withdrawVault,
  getVaultsDynamic,
  getUserVaultsPositions,
  clearUserData,
  getExpectedTransactionOutcome,
  clearTransactionData,
  getUserVaultsSummary,
} = VaultsActions;

const vaultsReducer = createReducer(vaultsInitialState, (builder) => {
  builder
    .addCase(initiateSaveVaults.pending, (state) => {
      state.statusMap.initiateSaveVaults = { loading: true };
    })
    .addCase(initiateSaveVaults.fulfilled, (state) => {
      state.statusMap.initiateSaveVaults = {};
    })
    .addCase(initiateSaveVaults.rejected, (state, { error }) => {
      state.statusMap.initiateSaveVaults = { error: error.message };
    })
    .addCase(getVaults.pending, (state) => {
      state.statusMap.getVaults = { loading: true };
    })
    .addCase(getVaults.fulfilled, (state, { payload: { vaultsData } }) => {
      const vaultsAddresses: string[] = [];
      vaultsData.forEach((vault) => {
        vaultsAddresses.push(vault.address);
        state.vaultsMap[vault.address] = vault;
        state.statusMap.vaultsActionsStatusMap[vault.address] = initialVaultActionsStatusMap;
        state.statusMap.user.userVaultsActionsStatusMap[vault.address] = initialUserVaultsActionsStatusMap;
      });
      state.vaultsAddresses = union(state.vaultsAddresses, vaultsAddresses);
      state.statusMap.getVaults = {};
    })
    .addCase(getVaults.rejected, (state, { error }) => {
      state.statusMap.getVaults = { error: error.message };
    })
    .addCase(getUserVaultsPositions.pending, (state, { meta }) => {
      const vaultAddresses = meta.arg.vaultAddresses || [];
      vaultAddresses.forEach((address) => {
        checkAndInitUserVaultStatus(state, address);
        state.statusMap.user.userVaultsActionsStatusMap[address].getPosition = { loading: true };
      });
      state.statusMap.user.getUserVaultsPositions = { loading: true };
    })
    .addCase(getUserVaultsPositions.fulfilled, (state, { meta, payload: { userVaultsPositions } }) => {
      const vaultsPositionsMap = parsePositionsIntoMap(userVaultsPositions);
      const vaultAddresses = meta.arg.vaultAddresses;
      vaultAddresses?.forEach((address) => {
        state.statusMap.user.userVaultsActionsStatusMap[address].getPosition = {};
      });

      userVaultsPositions.forEach((position) => {
        const address = position.assetAddress;
        const allowancesMap: any = {};
        position.assetAllowances.forEach((allowance) => (allowancesMap[allowance.spender] = allowance.amount));

        state.user.vaultsAllowancesMap[address] = allowancesMap;
      });

      state.user.userVaultsPositionsMap = { ...state.user.userVaultsPositionsMap, ...vaultsPositionsMap };
      state.statusMap.user.getUserVaultsPositions = {};
    })
    .addCase(getUserVaultsPositions.rejected, (state, { meta, error }) => {
      const vaultAddresses = meta.arg.vaultAddresses || [];
      vaultAddresses.forEach((address) => {
        state.statusMap.user.userVaultsActionsStatusMap[address].getPosition = {};
      });
      state.statusMap.user.getUserVaultsPositions = { error: error.message };
    })
    .addCase(setSelectedVaultAddress, (state, { payload: { vaultAddress } }) => {
      state.selectedVaultAddress = vaultAddress;
    })
    .addCase(getUserVaultsSummary.pending, (state) => {
      state.statusMap.user.getUserVaultsSumary = { loading: true };
    })
    .addCase(getUserVaultsSummary.fulfilled, (state, { payload: { userVaultsSumary } }) => {
      state.user.userVaultsSummary = userVaultsSumary;
      state.statusMap.user.getUserVaultsSumary = {};
    })
    .addCase(getUserVaultsSummary.rejected, (state, { error }) => {
      state.statusMap.user.getUserVaultsSumary = { error: error.message };
    })
    .addCase(depositVault.pending, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].deposit = { loading: true };
    })
    .addCase(depositVault.fulfilled, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].deposit = {};
    })
    .addCase(depositVault.rejected, (state, { error, meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].deposit = { error: error.message };
    })
    .addCase(approveDeposit.pending, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approve = { loading: true };
    })
    .addCase(approveDeposit.fulfilled, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approve = {};
    })
    .addCase(approveDeposit.rejected, (state, { error, meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approve = { error: error.message };
    })
    .addCase(approveZapOut.pending, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approveZapOut = { loading: true };
    })
    .addCase(approveZapOut.fulfilled, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approveZapOut = {};
    })
    .addCase(approveZapOut.rejected, (state, { error, meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approveZapOut = { error: error.message };
    })
    .addCase(withdrawVault.pending, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].withdraw = { loading: true };
    })
    .addCase(withdrawVault.fulfilled, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].withdraw = {};
    })
    .addCase(withdrawVault.rejected, (state, { error, meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].withdraw = { error: error.message };
    })
    .addCase(getVaultsDynamic.pending, (state, { meta }) => {
      const vaultAddresses = meta.arg.addresses;
      vaultAddresses.forEach((address) => {
        state.statusMap.vaultsActionsStatusMap[address].get = { loading: true };
      });
    })
    .addCase(getVaultsDynamic.fulfilled, (state, { meta, payload: { vaultsDynamicData } }) => {
      const vaultAddresses = meta.arg.addresses;
      vaultAddresses.forEach((address) => (state.statusMap.vaultsActionsStatusMap[address].get = {}));

      vaultsDynamicData.forEach((vaultDynamicData) => {
        const vaultAddress = vaultDynamicData.address;
        state.vaultsMap[vaultAddress] = {
          ...state.vaultsMap[vaultAddress],
          ...vaultDynamicData,
        };
      });
    })
    .addCase(getVaultsDynamic.rejected, (state, { error, meta }) => {
      const vaultAddresses = meta.arg.addresses;
      vaultAddresses.forEach((address) => {
        state.statusMap.vaultsActionsStatusMap[address].get = { error: error.message };
      });
    })
    .addCase(clearUserData, (state) => {
      state.user.userVaultsPositionsMap = {};
      state.user.vaultsAllowancesMap = {};
    })
    .addCase(getExpectedTransactionOutcome.pending, (state) => {
      state.statusMap.getExpectedTransactionOutcome = { loading: true };
    })
    .addCase(getExpectedTransactionOutcome.fulfilled, (state, { payload: { txOutcome } }) => {
      state.transaction.expectedOutcome = txOutcome;
      state.statusMap.getExpectedTransactionOutcome = {};
    })
    .addCase(getExpectedTransactionOutcome.rejected, (state, { error }) => {
      state.statusMap.getExpectedTransactionOutcome = { error: error.message };
    })
    .addCase(clearTransactionData, (state) => {
      state.transaction = initialTransaction;
    });
});

function parsePositionsIntoMap(positions: Position[]): { [vaultAddress: string]: VaultPositionsMap } {
  const grouped = groupBy(positions, 'assetAddress');
  const vaultsMap: { [vaultAddress: string]: any } = {};
  Object.entries(grouped).forEach(([key, value]) => {
    vaultsMap[key] = keyBy(value, 'typeId');
  });
  return vaultsMap;
}

function checkAndInitUserVaultStatus(state: VaultsState, vaultAddress: string) {
  const actionsMap = state.statusMap.user.userVaultsActionsStatusMap[vaultAddress];
  if (actionsMap) return;
  state.statusMap.user.userVaultsActionsStatusMap[vaultAddress] = { ...initialUserVaultsActionsStatusMap };
}

export default vaultsReducer;
