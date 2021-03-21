import { Theme } from '@types';
import { defaultTheme } from './default';

export const getTheme = (theme: Theme) => {
  switch (theme) {
    case 'default':
      return defaultTheme;
    default:
      return defaultTheme;
  }
};
