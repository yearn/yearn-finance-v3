import { RootState } from '@types';

const selectSidebarCollapsed = (state: RootState) => state.settings.sidebarCollapsed;
const selectDevModeSettings = (state: RootState) => state.settings.devMode;

export const SettingsSelectors = {
  selectSidebarCollapsed,
  selectDevModeSettings,
};
