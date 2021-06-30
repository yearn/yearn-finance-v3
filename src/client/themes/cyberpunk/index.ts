import { DefaultTheme } from 'styled-components';
import { sharedTheme } from '../default';

const cyberpunkTheme: DefaultTheme = {
  ...sharedTheme,
  colors: {
    primary: '#0CA7C9',
    background: '#3D305F',
    surface: '#523C6E',

    primaryVariant: '#7AF6FF',

    secondary: '#FBD282',
    secondaryVariantA: '#392850',
    secondaryVariantB: '#BB6FA1',

    surfaceVariantA: '#594177',
    surfaceVariantB: '#523C6E',

    selectionBar: '#D35290',

    onPrimary: '#7AF6FF',
    onPrimaryVariant: '#FBD282',
    onBackground: '#FBD282',

    onSurfaceH1: '#D35290',
    onSurfaceH1Contrast: '#0CA7C9',
    onSurfaceH2: '#0CA7C9',
    onSurfaceH2Hover: '#FBD282',
    onSurfaceSH1: '#BB6FA1',
    onSurfaceSH1Hover: '#523C6E',

    upTrend: '#ADFF00',
    downTrend: '#DE0B3B',

    vaultActionButton: {
      background: 'transparent',
      borderColor: '#BB6FA1',
      color: '#BB6FA1',
    },

    walletButton: {
      background: '#0CA7C9',
      color: '#FBD282',
    },

    txModalColors: {
      background: '#191919',
      backgroundVariant: '#000000',
      onBackgroundVariant: '#202020',
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

export { cyberpunkTheme };
