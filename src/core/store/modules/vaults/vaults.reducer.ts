import { createReducer } from '@reduxjs/toolkit';
import { initialStatus, VaultsState } from '@types';
import { VaultsActions } from './vaults.actions';

export const initialVaultActionsStatusMap = {
  approve: initialStatus,
  deposit: initialStatus,
  withdraw: initialStatus,
  get: initialStatus,
};

const initialState: VaultsState = {
  saveVaultsAddreses: [],
  vaultsMap: {},
  selectedVaultAddress: undefined,
  user: {
    userVaultsMap: {},
  },
  statusMap: {
    initiateSaveVaults: { loading: false, error: null },
    getVaults: { loading: false, error: null },
    vaultsActionsStatusMap: {},
    getUserVaults: { loading: false, error: null },
    userVaultsActionsStatusMap: {},
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
  getUserVaultsData,
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
    .addCase(getVaults.fulfilled, (state, { payload: { vaultsMap, vaultsAddreses } }) => {
      const vaultsActionsStatusMap: any = {};
      vaultsAddreses.forEach((address) => (vaultsActionsStatusMap[address] = initialVaultActionsStatusMap));
      state.saveVaultsAddreses = vaultsAddreses;
      state.vaultsMap = { ...state.vaultsMap, ...vaultsMap };
      state.statusMap.getVaults = {};
      state.statusMap.vaultsActionsStatusMap = vaultsActionsStatusMap;
    })
    .addCase(getVaults.rejected, (state, { error }) => {
      state.statusMap.getVaults = { error: error.message };
    })
    .addCase(getUserVaultsData.pending, (state) => {
      state.statusMap.getUserVaults = { loading: true };
    })
    .addCase(getUserVaultsData.fulfilled, (state, { payload: { userVaultsMap } }) => {
      state.user.userVaultsMap = { ...state.user.userVaultsMap, ...userVaultsMap };
      state.statusMap.getUserVaults = {};
    })
    .addCase(getUserVaultsData.rejected, (state, { error }) => {
      state.statusMap.getUserVaults = { error: error.message };
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
    .addCase(getVaultsDynamic.fulfilled, (state, { payload: { vaultsDynamicData } }) => {
      vaultsDynamicData.forEach((vaultDynamicData) => {
        const vaultAddress = vaultDynamicData.address;
        state.vaultsMap[vaultAddress] = {
          ...state.vaultsMap[vaultAddress],
          ...vaultDynamicData,
        };
        state.statusMap.vaultsActionsStatusMap[vaultDynamicData.address].get = {};
      });
    })
    .addCase(getVaultsDynamic.rejected, (state, { error, meta }) => {
      const vaultAddresses: string[] = meta.arg.addresses;
      vaultAddresses.forEach((address) => {
        state.statusMap.vaultsActionsStatusMap[address].get = { error: error.message };
      });
    });
});

export default vaultsReducer;
