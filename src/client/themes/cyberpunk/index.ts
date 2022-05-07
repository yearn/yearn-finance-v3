import { DefaultTheme } from 'styled-components';

import { sharedTheme } from '../default';

const cyberpunkTheme: DefaultTheme = {
  ...sharedTheme,
  colors: {
    logo: '#0CA7C9',

    primary: '#0CA7C9',
    background: '#3D305F',
    surface: '#523C6E',

    primaryVariant: '#7AF6FF',

    secondary: '#3D305F',

    backgroundVariant: '#3D305F',
    icons: {
      primary: '#0CA7C9',
      variant: '#0CA7C9',
    },
    titles: '#0CA7C9',
    titlesVariant: '#0CA7C9',
    texts: '#9dd9e6',
    surfaceVariant: '#FFF',

    secondaryVariantA: '#392850',
    secondaryVariantB: '#BB6FA1',

    surfaceVariantA: '#594177',
    surfaceVariantB: '#523C6E',

    selectionBar: '#D35290',

    onPrimaryVariant: '#FBD282',
    onBackground: '#FBD282',

    upTrend: '#ADFF00',
    downTrend: '#DE0B3B',

    toggleSwitch: {
      background: 'transparent',
      color: '#0CA7C9',

      selected: {
        background: '#D35290',
        color: '#0CA7C9',
      },
    },

    vaultActionButton: {
      background: 'transparent',
      borderColor: '#BB6FA1',
      color: '#BB6FA1',
      iconFill: '#3D305F',
      // disabledContrast: '0.6',

      selected: {
        background: 'transparent',
        borderColor: '#3D305F',
        color: '#3D305F',
      },
    },

    txModalColors: {
      background: '#523C6E',
      backgroundVariant: '#392850',
      onBackgroundVariantColor: '#BB6FA1',
      primary: '#00A3FF',
      onPrimary: '#FFFFFF',
      loading: '#FFA800',
      error: {
        backgroundColor: '#FFD9D9',
        color: '#FF0000',
      },
      warning: {
        backgroundColor: '#FFF9D9',
        color: '#FF8A00',
      },
      success: '#C6E11E',
      text: '#D35290',
      textContrast: '#FBD282',
    },
  },
};

export { cyberpunkTheme };
