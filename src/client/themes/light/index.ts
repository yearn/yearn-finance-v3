import { DefaultTheme } from 'styled-components';
import { sharedTheme } from '../default';

const lightTheme: DefaultTheme = {
  ...sharedTheme,
  colors: {
    primary: '#000000',
    primaryVariant: '#FFFFFF',

    secondary: '#000000',
    secondaryVariantA: '#000000',
    secondaryVariantB: '#000000',

    onPrimary: '#FFFFFF',
    onPrimaryVariant: '#FFFFFF',

    background: '#FFFFFF',
    onBackground: '#000000',

    surface: '#FFFFFF',
    surfaceVariant: '#FFFFFF',
    onSurface: '#000000',
    onSurfaceVariantA: '#000000',
    onSurfaceVariantB: '#F0F0F0',

    upTrend: '#DBFF00',
    downTrend: '#FF005E',

    hoverHbar: '#000000',
  },
};

export { lightTheme };
