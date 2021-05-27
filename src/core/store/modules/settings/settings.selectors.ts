import { RootState } from '@types';

const selectSidebarCollapsed = (state: RootState) => state.settings.sidebarCollapsed;

export const SettingsSelectors = {
  selectSidebarCollapsed,
};
