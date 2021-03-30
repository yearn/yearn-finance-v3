import { Theme } from '@types';
import { DefaultTheme } from 'styled-components';

import { defaultTheme } from './default';

export const getTheme = (theme?: Theme): DefaultTheme => {
  switch (theme) {
    case 'default':
      return defaultTheme;
    default:
      return defaultTheme;
  }
};
