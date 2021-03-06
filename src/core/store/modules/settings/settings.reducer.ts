import { createReducer } from '@reduxjs/toolkit';

import { SettingsState } from '@types';
import { getConfig } from '@config';

import { SettingsActions } from './settings.actions';

export const settingsInitialState: SettingsState = {
  stateVersion: getConfig().STATE_VERSION,
  sidebarCollapsed: false,
  defaultSlippage: getConfig().DEFAULT_SLIPPAGE,
  signedApprovalsEnabled: true,
  devMode: {
    enabled: false,
    walletAddressOverride: '',
  },
};

const {
  toggleSidebar,
  closeSidebar,
  openSidebar,
  toggleSignedApprovals,
  setDefaultSlippage,
  toggleDevMode,
  changeWalletAddressOverride,
} = SettingsActions;

const settingsReducer = createReducer(settingsInitialState, (builder) => {
  builder
    .addCase(closeSidebar, (state) => {
      state.sidebarCollapsed = true;
    })
    .addCase(openSidebar, (state) => {
      state.sidebarCollapsed = false;
    })
    .addCase(toggleSidebar, (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    })
    .addCase(toggleSignedApprovals, (state) => {
      state.signedApprovalsEnabled = !state.signedApprovalsEnabled;
    })
    .addCase(setDefaultSlippage.fulfilled, (state, { payload: { slippage } }) => {
      state.defaultSlippage = slippage;
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
