import { DefaultTheme } from 'styled-components';
import { sharedTheme } from '../default';

const darkTheme: DefaultTheme = {
  ...sharedTheme,
  colors: {
    logo: '#006AE3',

    primary: '#202020',
    background: '#191919',
    surface: '#202020',

    primaryVariant: '#777777',

    secondary: '#FFFFFF',
    secondaryVariantA: '#000000',
    secondaryVariantB: '#585858',

    surfaceVariantA: '#1C1C1C',
    surfaceVariantB: '#000000',

    selectionBar: '#000000',

    onPrimaryVariant: '#FFFFFF',
    onBackground: '#000000',

    onSurfaceH1: '#888888',
    onSurfaceH1Contrast: '#FFFFFF',
    onSurfaceH2: '#FFFFFF',
    onSurfaceH2Hover: '#FFFFFF',
    onSurfaceSH1: '#6E6E6E',
    onSurfaceSH1Hover: '#FFFFFF',

    upTrend: '#C6E11E',
    downTrend: '#FF005E',

    vaultActionButton: {
      background: 'transparent',
      borderColor: '#6E6E6E',
      color: '#6E6E6E',
      disabledContrast: '1.5',

      selected: {
        background: 'transparent',
        borderColor: '#FFFFFF',
        color: '#FFFFFF',
      },
    },

    walletButton: {
      background: '#006AE3',
      color: '#202020',
    },

    txModalColors: {
      background: '#191919',
      backgroundVariant: '#000000',
      onBackgroundVariant: '#202020',
      onBackgroundVariantB: '#202020',
      onBackgroundVariantColor: '#555555',
      primary: '#00A3FF',
      loading: '#FFA800',
      error: '#FF005E',
      success: '#C6E11E',
      text: '#888888',
      textContrast: '#FFFFFF',
    },
  },
};

export { darkTheme };
