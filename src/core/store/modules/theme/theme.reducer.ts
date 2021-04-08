import { createReducer } from '@reduxjs/toolkit';
import { ThemeState } from '@types';
import { ThemeActions } from './theme.actions';

const initialState: ThemeState = {
  current: 'default',
};

const themeReducer = createReducer(initialState, (builder) => {
  builder.addCase(ThemeActions.changeTheme, (state, { payload: { theme } }) => {
    state.current = theme;
  });
});

export default themeReducer;
