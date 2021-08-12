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

    selectionBar: 'rgba(0, 0, 0, .1)',

    onPrimary: '#B4B4B4',
    onPrimaryVariant: '#000000',
    onBackground: '#000000',

    onSurfaceH1: '#FFFFFF',
    onSurfaceH1Contrast: '#FFFFFF',
    onSurfaceH2: '#000000',
    onSurfaceH2Hover: '#000000',
    onSurfaceSH1: '#888888',
    onSurfaceSH1Hover: '#000000',

    upTrend: '#C6E11E',
    downTrend: '#FF005E',

    vaultActionButton: {
      background: 'transparent',
      borderColor: '#000000',
      color: '#000000',
    },

    walletButton: {
      background: '#006AE3',
      color: '#FFFFFF',
    },

    txModalColors: {
      background: '#FFFFFF',
      backgroundVariant: '#E8E8EA',
      onBackgroundVariant: '#FFFFFF',
      onBackgroundVariantColor: '#555555',
      primary: '#00A3FF',
      loading: '#FFA800',
      error: '#FF005E',
      success: '#C6E11E',
      text: '#888888',
      textContrast: '#000000',
    },
  },
};

export { lightTheme };
