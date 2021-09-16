import { createReducer } from '@reduxjs/toolkit';
import { ThemeState } from '@types';
import { getConfig } from '@config';

import { ThemeActions } from './theme.actions';

export const themeInitialState: ThemeState = {
  current: getConfig().DEFAULT_THEME,
};

const { changeTheme } = ThemeActions;

const themeReducer = createReducer(themeInitialState, (builder) => {
  builder.addCase(changeTheme.fulfilled, (state, { payload: { theme } }) => {
    // TODO Check that the theme exists on AVAILABLE_THEMES
    state.current = theme;
  });
});

export default themeReducer;
