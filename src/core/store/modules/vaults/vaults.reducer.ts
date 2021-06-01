import { groupBy, keyBy, union } from 'lodash';

import { createReducer } from '@reduxjs/toolkit';
import { initialStatus, VaultsState, VaultPositionsMap, Position, UserVaultActionsStatusMap } from '@types';
import { VaultsActions } from './vaults.actions';

export const initialVaultActionsStatusMap = {
  approve: initialStatus,
  deposit: initialStatus,
  withdraw: initialStatus,
  get: initialStatus,
};

export const initialUserVaultsActionsStatusMap: UserVaultActionsStatusMap = {
  getPosition: initialStatus,
};

const initialState: VaultsState = {
  vaultsAddresses: [],
  vaultsMap: {},
  selectedVaultAddress: undefined,
  user: {
    userVaultsPositionsMap: {},
    vaultsAllowancesMap: {},
  },
  statusMap: {
    initiateSaveVaults: { loading: false, error: null },
    getVaults: { loading: false, error: null },
    vaultsActionsStatusMap: {},
    user: {
      getUserVaultsPositions: { loading: false, error: null },
      userVaultsActionsStatusMap: {},
    },
  },
};

const {
  approveVault,
  depositVault,
  getVaults,
  initiateSaveVaults,
  setSelectedVaultAddress,
  withdrawVault,
  getVaultsDynamic,
  getUserVaultsPositions,
} = VaultsActions;

const vaultsReducer = createReducer(initialState, (builder) => {
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
      const vaultAddress: string[] = [];
      vaultsData.forEach((vault) => {
        vaultAddress.push(vault.address);
        state.vaultsMap[vault.address] = vault;
        state.statusMap.vaultsActionsStatusMap[vault.address] = initialVaultActionsStatusMap;
        state.statusMap.user.userVaultsActionsStatusMap[vault.address] = initialUserVaultsActionsStatusMap;
      });
      state.vaultsAddresses = union(state.vaultsAddresses, vaultAddress);
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
    .addCase(approveVault.pending, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approve = { loading: true };
    })
    .addCase(approveVault.fulfilled, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approve = {};
    })
    .addCase(approveVault.rejected, (state, { error, meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approve = { error: error.message };
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
      const vaultAddresses: string[] = meta.arg.addresses;
      vaultAddresses.forEach((address) => {
        state.statusMap.vaultsActionsStatusMap[address].get = { error: error.message };
      });
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
