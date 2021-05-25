import { Theme } from '@types';
import { DefaultTheme } from 'styled-components';

import { cyberpunkTheme } from './cyberpunk';
import { darkTheme } from './dark';
import { lightTheme } from './light';

export const AVAILABLE_THEMES: Theme[] = ['light', 'dark', 'cyberpunk'];

export const getTheme = (theme?: Theme): DefaultTheme => {
  switch (theme) {
    case 'default':
      return lightTheme;
    case 'light':
      return lightTheme;
    case 'dark':
      return darkTheme;
    case 'cyberpunk':
      return cyberpunkTheme;
    default:
      return lightTheme;
  }
};
