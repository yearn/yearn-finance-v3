import { createAction } from '@reduxjs/toolkit';

const toggleSidebar = createAction('modals/toggleSidebar');

export const SettingsActions = {
  toggleSidebar,
};
