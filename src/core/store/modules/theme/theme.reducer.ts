import { createReducer } from '@reduxjs/toolkit';
import { ThemeState } from '@types';
import { changeTheme } from './theme.actions';

const initialState: ThemeState = {
  current: 'default',
};

const themeReducer = createReducer(initialState, (builder) => {
  builder.addCase(changeTheme, (state, { payload: { theme } }) => {
    state.current = theme;
  });
});

export default themeReducer;
