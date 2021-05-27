import { createReducer } from '@reduxjs/toolkit';
import { SettingsState } from '@types';
import { SettingsActions } from './settings.actions';

const initialState: SettingsState = {
  sidebarCollapsed: false,
};

const { toggleSidebar } = SettingsActions;

const settingsReducer = createReducer(initialState, (builder) => {
  builder.addCase(toggleSidebar, (state) => {
    console.log('COLLAPSE');

    state.sidebarCollapsed = !state.sidebarCollapsed;
  });
});

export default settingsReducer;
