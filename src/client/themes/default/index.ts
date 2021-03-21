import { DefaultTheme } from 'styled-components';

const defaultTheme: DefaultTheme = {
  colors: {
    primary: '#006AE3',
    secondary: '#01E2A0',
    surface: '#0A1D3F',
    background: '#1F255F',
    error: '#EF1E02',
    onPrimary: '#FFF',
    onSecondary: '#FFF',
    onSurface: '#FFF',
    onBackground: '#FFF',
    onError: '#FFF',
    black: '#000',
    white: '#FFF',
    text: '#FFF',
  },
  fontFamily: 'Open Sans',
  fonts: ['Open Sans'],
  fontSizes: [12, 14, 16, 18, 20, 24, 28, 32],
  fontWeights: [400, 600, 700],
  space: [0, 2, 4, 6, 8, 12, 16, 32],
};

export { defaultTheme };
