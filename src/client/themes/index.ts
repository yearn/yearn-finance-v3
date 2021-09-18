import { Theme } from '@types';
import { DefaultTheme } from 'styled-components';

import { cyberpunkTheme } from './cyberpunk';
import { darkTheme } from './dark';
import { lightTheme } from './light';
import { classicTheme } from './classic';

export const getTheme = (theme?: Theme): DefaultTheme => {
  switch (theme) {
    case 'light':
      return lightTheme;
    case 'dark':
      return darkTheme;
    case 'cyberpunk':
      return cyberpunkTheme;
    case 'classic':
      return classicTheme;
    default:
      return lightTheme;
  }
};
