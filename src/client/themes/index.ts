import { Theme } from '@types';
import { DefaultTheme } from 'styled-components';

import { cyberpunkTheme } from './cyberpunk';
import { lightTheme } from './light';

export const AVAILABLE_THEMES: Theme[] = ['light', 'cyberpunk'];

export const getTheme = (theme?: Theme): DefaultTheme => {
  switch (theme) {
    case 'default':
      return lightTheme;
    case 'light':
      return lightTheme;
    case 'cyberpunk':
      return cyberpunkTheme;
    default:
      return lightTheme;
  }
};
