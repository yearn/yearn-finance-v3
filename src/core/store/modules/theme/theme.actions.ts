import { createAction } from '@reduxjs/toolkit';
import { Theme } from '@types';

const changeTheme = createAction<{ theme: Theme }>('theme/changeTheme');

export const ThemeActions = {
  changeTheme,
};
