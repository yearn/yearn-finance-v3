import { createReducer } from '@reduxjs/toolkit';
import { initialStatus, VaultsState } from '@types';
import { VaultsActions } from './vaults.actions';

export const initialVaultActionsStatusMap = {
  approve: initialStatus,
  deposit: initialStatus,
  withdraw: initialStatus,
};

const initialState: VaultsState = {
  saveVaultsAddreses: [],
  vaultsMap: {},
  selectedVaultAddress: undefined,
  statusMap: {
    initiateSaveVaults: { loading: false, error: null },
    getVaults: { loading: false, error: null },
    vaultsActionsStatusMap: {},
  },
};

const vaultsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(VaultsActions.initiateSaveVaults.pending, (state) => {
      state.statusMap.initiateSaveVaults = { loading: true };
    })
    .addCase(VaultsActions.initiateSaveVaults.fulfilled, (state) => {
      state.statusMap.initiateSaveVaults = {};
    })
    .addCase(VaultsActions.initiateSaveVaults.rejected, (state, { error }) => {
      state.statusMap.initiateSaveVaults = { error: error.message };
    })
    .addCase(VaultsActions.getVaults.pending, (state) => {
      state.statusMap.getVaults = { loading: true };
    })
    .addCase(VaultsActions.getVaults.fulfilled, (state, { payload: { vaultsMap, vaultsAddreses } }) => {
      const vaultsActionsStatusMap: any = {};
      vaultsAddreses.forEach((address) => (vaultsActionsStatusMap[address] = initialVaultActionsStatusMap));
      state.saveVaultsAddreses = vaultsAddreses;
      state.vaultsMap = { ...state.vaultsMap, ...vaultsMap };
      state.statusMap.getVaults = {};
      state.statusMap.vaultsActionsStatusMap = vaultsActionsStatusMap;
    })
    .addCase(VaultsActions.getVaults.rejected, (state, { error }) => {
      state.statusMap.getVaults = { error: error.message };
    })
    .addCase(VaultsActions.setSelectedVaultAddress, (state, { payload: { vaultAddress } }) => {
      state.selectedVaultAddress = vaultAddress;
    })
    .addCase(VaultsActions.depositVault.pending, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].deposit = { loading: true };
    })
    .addCase(VaultsActions.depositVault.fulfilled, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].deposit = {};
    })
    .addCase(VaultsActions.depositVault.rejected, (state, { error, meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].deposit = { error: error.message };
    })
    .addCase(VaultsActions.approveVault.pending, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approve = { loading: true };
    })
    .addCase(VaultsActions.approveVault.fulfilled, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approve = {};
    })
    .addCase(VaultsActions.approveVault.rejected, (state, { error, meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].approve = { error: error.message };
    })
    .addCase(VaultsActions.withdrawVault.pending, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].withdraw = { loading: true };
    })
    .addCase(VaultsActions.withdrawVault.fulfilled, (state, { meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].withdraw = {};
    })
    .addCase(VaultsActions.withdrawVault.rejected, (state, { error, meta }) => {
      const vaultAddress = meta.arg.vaultAddress;
      state.statusMap.vaultsActionsStatusMap[vaultAddress].withdraw = { error: error.message };
    });
});

export default vaultsReducer;
