import { DefaultTheme } from 'styled-components';

import { Theme } from '@types';

import { cyberpunkTheme } from './cyberpunk';
import { darkTheme } from './dark';
import { lightTheme } from './light';
import { classicTheme } from './classic';
import { explorerTheme } from './explorer';

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
    case 'explorer':
      return explorerTheme;
    default:
      const { matches: prefersColorSchemeDark } = window?.matchMedia('(prefers-color-scheme: dark)');
      return prefersColorSchemeDark ? darkTheme : lightTheme;
  }
};
