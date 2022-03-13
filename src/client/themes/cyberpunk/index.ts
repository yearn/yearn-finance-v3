import { DefaultTheme } from 'styled-components';

import { sharedTheme } from '../default';

const cyberpunkTheme: DefaultTheme = {
  ...sharedTheme,
  colors: {
    logo: '#392850',

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

    toggleSwitch: {
      background: '#b5b5b5',
      color: '#E5E5E5',

      selected: {
        background: '#C6E11E',
        color: '#fff',
      },
    },

    vaultActionButton: {
      background: 'transparent',
      borderColor: '#BB6FA1',
      color: '#BB6FA1',
      disabledContrast: '0.6',

      selected: {
        background: 'transparent',
        borderColor: '#3D305F',
        color: '#3D305F',
      },
    },

    walletButton: {
      background: '#0CA7C9',
      color: '#FBD282',
    },

    txModalColors: {
      background: '#3D305F',
      backgroundVariant: '#392850',
      onBackgroundVariant: '#523C6E',
      onBackgroundVariantB: '#523C6E',
      onBackgroundVariantColor: '#BB6FA1',
      primary: '#00A3FF',
      loading: '#FFA800',
      error: '#FF005E',
      warning: '#FF7500',
      success: '#C6E11E',
      text: '#D35290',
      textContrast: '#FBD282',
    },
  },
};

export { cyberpunkTheme };
