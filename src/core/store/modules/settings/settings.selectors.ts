import { RootState } from '@types';

const selectSidebarCollapsed = (state: RootState) => state.settings.sidebarCollapsed;
const selectDefaultSlippage = (state: RootState) => state.settings.defaultSlippage;
const selectDevModeSettings = (state: RootState) => state.settings.devMode;
const selectSignedApprovalsEnabled = (state: RootState) => state.settings.signedApprovalsEnabled;

export const SettingsSelectors = {
  selectSidebarCollapsed,
  selectDefaultSlippage,
  selectDevModeSettings,
  selectSignedApprovalsEnabled,
};
