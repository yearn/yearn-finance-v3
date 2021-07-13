import { createReducer } from '@reduxjs/toolkit';
import { SettingsState } from '@types';
import { getConfig } from '@config';
import { SettingsActions } from './settings.actions';

export const settingsInitialState: SettingsState = {
  stateVersion: getConfig().STATE_VERSION,
  sidebarCollapsed: false,
  defaultSlippage: getConfig().DEFAULT_SLIPPAGE,
  devMode: {
    enabled: false,
    walletAddressOverride: '',
  },
};

const { toggleSidebar, closeSidebar, setDefaultSlippage, toggleDevMode, changeWalletAddressOverride } = SettingsActions;

const settingsReducer = createReducer(settingsInitialState, (builder) => {
  builder
    .addCase(closeSidebar, (state) => {
      state.sidebarCollapsed = true;
    })
    .addCase(toggleSidebar, (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
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
