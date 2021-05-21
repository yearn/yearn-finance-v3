import { DefaultTheme } from 'styled-components';
import { sharedTheme } from '../default';

const darkTheme: DefaultTheme = {
  ...sharedTheme,
  colors: {
    primary: '#202020',
    background: '#191919',
    surface: '#202020',

    primaryVariant: '#585858',

    secondary: '#FFFFFF',
    secondaryVariantA: '#000000',
    secondaryVariantB: '#585858',

    surfaceVariantA: '#1C1C1C',
    surfaceVariantB: '#000000',

    selectionBar: '#000000',

    onPrimary: '#585858',
    onPrimaryVariant: '#FFFFFF',
    onBackground: '#000000',

    onSurfaceH1: '#888888',
    onSurfaceH2: '#FFFFFF',
    onSurfaceH2Hover: '#FFFFFF',
    onSurfaceSH1: '#555555',
    onSurfaceSH1Hover: '#FFFFFF',

    actionButton: '#555555',

    upTrend: '#C6E11E',
    downTrend: '#FF005E',
  },
};

export { darkTheme };
