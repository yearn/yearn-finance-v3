import { createAction } from '@reduxjs/toolkit';
import { Theme } from '@types';

export const ThemeActions = {
  changeTheme: createAction<{ theme: Theme }>('theme/changeTheme'),
};
