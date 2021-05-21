import { DefaultTheme } from 'styled-components';
import { sharedTheme } from '../default';

const lightTheme: DefaultTheme = {
  ...sharedTheme,
  colors: {
    primary: '#F0F0F0',
    background: '#FFFFFF',
    surface: '#F0F0F0',

    primaryVariant: '#B4B4B4',

    secondary: '#000000',
    secondaryVariantA: '#000000',
    secondaryVariantB: '#000000',

    surfaceVariantA: '#E8E8EA',
    surfaceVariantB: '#000000',

    selectionBar: 'rgba(#000000, .1)',

    onPrimary: '#B4B4B4',
    onPrimaryVariant: '#000000',
    onBackground: '#000000',

    onSurfaceH1: '#FFFFFF',
    onSurfaceH2: '#000000',
    onSurfaceH2Hover: '#000000',
    onSurfaceSH1: '#888888',
    onSurfaceSH1Hover: '#000000',

    actionButton: '#000000',

    upTrend: '#C6E11E',
    downTrend: '#FF005E',
  },
};

export { lightTheme };
