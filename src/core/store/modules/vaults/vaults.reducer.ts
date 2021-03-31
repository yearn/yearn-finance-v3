import { createReducer } from '@reduxjs/toolkit';
import { VaultsState } from '@types';
import { getVaults, initiateSaveVaults, setSelectedVaultAddress } from './vaults.actions';

const initialState: VaultsState = {
  saveVaultsAddreses: [],
  vaultsMap: {},
  selectedVaultAddress: undefined,
  statusMap: {
    initiateSaveVaults: { loading: false, error: null },
    getVaults: { loading: false, error: null },
  },
};

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
      state.saveVaultsAddreses = vaultsAddreses;
      state.vaultsMap = { ...state.vaultsMap, ...vaultsMap };
      state.statusMap.getVaults = {};
    })
    .addCase(getVaults.rejected, (state, { error }) => {
      state.statusMap.getVaults = { error: error.message };
    })
    .addCase(setSelectedVaultAddress, (state, { payload: { vaultAddress } }) => {
      state.selectedVaultAddress = vaultAddress;
    });
});

export default vaultsReducer;
