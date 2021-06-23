import { createReducer } from '@reduxjs/toolkit';
import { SettingsState } from '@types';
import { SettingsActions } from './settings.actions';

const STATE_VERSION = 1;

export const settingsInitialState: SettingsState = {
  currentStateVersion: STATE_VERSION,
  persistedStateVersion: STATE_VERSION,
  sidebarCollapsed: false,
  devMode: {
    enabled: false,
    walletAddressOverride: '',
  },
};

const { toggleSidebar, closeSidebar, toggleDevMode, changeWalletAddressOverride } = SettingsActions;

const settingsReducer = createReducer(settingsInitialState, (builder) => {
  builder
    .addCase(closeSidebar, (state) => {
      state.sidebarCollapsed = true;
    })
    .addCase(toggleSidebar, (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    })
    .addCase(toggleDevMode.fulfilled, (state, { payload: { enable } }) => {
      state.devMode.enabled = enable;
      state.devMode.walletAddressOverride = '';
    })
    .addCase(changeWalletAddressOverride.fulfilled, (state, { meta }) => {
      state.devMode.walletAddressOverride = meta.arg.address;
    });
});

export default settingsReducer;
