import { DefaultTheme } from 'styled-components';

import { sharedTheme } from '../default';

// TODO Dehardcode this
const light = {
  name: 'light',
  colors: {
    background: '#F4F7FB',
    backgroundVariant: '#E0EAFF',
    surface: '#FFFFFF',
    surfaceVariant: '#F9FBFD',
    primary: '#0657F9',
    primaryVariant: '#004ADF',
    secondary: '#E0EAFF',
    titles: '#001746',
    titlesVariant: '#0657F9',
    texts: '#7F8DA9',
    icons: '#CED5E3',
    iconsVariant: '#475570',
  },
};

const lightTheme: DefaultTheme = {
  ...sharedTheme,
  colors: {
    logo: '#0657F9',

    primary: light.colors.primary,
    background: light.colors.background,
    surface: light.colors.surface,

    primaryVariant: light.colors.primaryVariant,

    secondary: light.colors.secondary,

    iconsVariant: light.colors.iconsVariant,

    secondaryVariantA: '#000000',
    secondaryVariantB: '#000000',

    surfaceVariantA: '#E8E8EA',
    surfaceVariantB: '#000000',

    selectionBar: '#000000',

    onPrimaryVariant: '#000000',
    onBackground: '#000000',

    onSurfaceH1: '#FFFFFF',
    onSurfaceH1Contrast: '#FFFFFF',
    onSurfaceH2: '#000000',
    onSurfaceH2Hover: '#FFFFFF',
    onSurfaceSH1: '#888888',
    onSurfaceSH1Hover: '#000000',

    upTrend: '#A8C300',
    downTrend: '#FF005E',

    vaultActionButton: {
      background: 'transparent',
      borderColor: '#000000',
      color: '#000000',
      disabledContrast: '0',

      selected: {
        background: 'transparent',
        borderColor: '#FFFFFF',
        color: '#FFFFFF',
      },
    },

    walletButton: {
      background: '#000000',
      color: '#FFFFFF',
    },

    txModalColors: {
      background: '#FFFFFF',
      backgroundVariant: '#E8E8EA',
      onBackgroundVariant: '#FFFFFF',
      onBackgroundVariantB: '#F0F0F0',
      onBackgroundVariantColor: '#6e6e6e',
      primary: '#00A3FF',
      loading: '#FFA800',
      error: '#FF005E',
      warning: '#FFA800',
      success: '#A8C300',
      text: '#000000',
      textContrast: '#000000',
    },
  },
};

export { lightTheme };
