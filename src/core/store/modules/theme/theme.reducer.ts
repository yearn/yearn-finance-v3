import { createReducer } from '@reduxjs/toolkit';
import { ThemeState } from '@types';
import { getConfig } from '@config';

import { ThemeActions } from './theme.actions';

const initialState: ThemeState = {
  current: getConfig().DEFAULT_THEME,
};

const { changeTheme } = ThemeActions;

const themeReducer = createReducer(initialState, (builder) => {
  builder.addCase(changeTheme, (state, { payload: { theme } }) => {
    // TODO Check that the theme exists on AVAILABLE_THEMES
    state.current = theme;
  });
});

export default themeReducer;
