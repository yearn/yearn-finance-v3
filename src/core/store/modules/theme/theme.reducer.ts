import { createReducer } from '@reduxjs/toolkit';
import { ThemeState } from '@types';
import { DEFAULT_THEME } from '@themes';
import { ThemeActions } from './theme.actions';

const initialState: ThemeState = {
  current: DEFAULT_THEME,
};

const { changeTheme } = ThemeActions;

const themeReducer = createReducer(initialState, (builder) => {
  builder.addCase(changeTheme, (state, { payload: { theme } }) => {
    state.current = theme;
  });
});

export default themeReducer;
