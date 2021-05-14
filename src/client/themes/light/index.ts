import { ThemePallete } from 'styled-components';
import { defaultTheme } from '../default';

const lightTheme: ThemePallete = {
  ...defaultTheme,
  themeColors: {
    primary: '#000000',
    primaryVariant: '#000000',

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
    onSurfaceVariantB: '#000000',

    upTrend: '#DBFF00',
    downTrend: '#FF005E',

    hoverHbar: '#000000',
  },
};

export { lightTheme };
