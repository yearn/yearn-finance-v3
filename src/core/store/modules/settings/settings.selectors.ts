import { RootState } from '@types';

const selectSidebarCollapsed = (state: RootState) => state.settings.sidebarCollapsed;
const selectDefaultSlippage = (state: RootState) => state.settings.defaultSlippage;
const selectDevModeSettings = (state: RootState) => state.settings.devMode;

export const SettingsSelectors = {
  selectSidebarCollapsed,
  selectDefaultSlippage,
  selectDevModeSettings,
};
