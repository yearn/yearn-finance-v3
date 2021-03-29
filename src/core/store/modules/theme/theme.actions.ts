import { createAction } from '@reduxjs/toolkit';
import { Theme } from '@types';

export const changeTheme = createAction<{ theme: Theme }>('theme/changeTheme');
