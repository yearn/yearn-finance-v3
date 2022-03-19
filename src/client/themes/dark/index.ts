import { DefaultTheme } from 'styled-components';

import { sharedTheme } from '../default';

// TODO Dehardcode this
const dark = {
  name: 'dark',
  colors: {
    background: '#141414',
    backgroundVariant: '#272727',
    surface: '#000000',
    surfaceVariant: '#191919',
    primary: '#FFFFFF',
    primaryVariant: '#FFFFFF',
    secondary: '#272727',
    titles: '#FFFFFF',
    titlesVariant: '#FFFFFF',
    texts: '#A8A8A8',
    disabled: '#A8A8A8',
    icons: {
      primary: '#A8A8A8',
      variant: '#FFFFFF',
    },
    button: {
      filled: {
        primary: '#0657F9',
        variant: '#004ADF',
        text: '#FFFFFF',
      },
      outlined: {
        primary: '#FFFFFF',
        variant: '#272727',
        text: '#FFFFFF',
      },
      disabled: {
        primary: '#141414',
        text: '#A8A8A8',
      },
    },
  },
};

const darkTheme: DefaultTheme = {
  ...sharedTheme,
  colors: {
    logo: '#006AE3',

    primary: dark.colors.primary,
    background: dark.colors.background,
    surface: dark.colors.surface,

    primaryVariant: dark.colors.primaryVariant,

    secondary: dark.colors.secondary,

    backgroundVariant: dark.colors.backgroundVariant,
    icons: {
      primary: dark.colors.icons.primary,
      variant: dark.colors.icons.variant,
    },
    titles: dark.colors.titles,
    titlesVariant: dark.colors.titlesVariant,
    texts: dark.colors.texts,
    surfaceVariant: dark.colors.surfaceVariant,

    secondaryVariantA: '#000000',
    secondaryVariantB: '#585858',

    surfaceVariantA: '#1C1C1C',
    surfaceVariantB: '#000000',

    selectionBar: dark.colors.surfaceVariant,

    onPrimaryVariant: '#FFFFFF',
    onBackground: '#000000',

    upTrend: '#C6E11E',
    downTrend: '#FF005E',

    toggleSwitch: {
      background: 'transparent',
      color: '#E5E5E5',

      selected: {
        background: '#C6E11E',
        color: 'white',
      },
    },

    vaultActionButton: {
      background: 'transparent',
      borderColor: '#6E6E6E',
      color: '#6E6E6E',
      // disabledContrast: '1.5',

      selected: {
        background: 'transparent',
        borderColor: '#FFFFFF',
        color: '#FFFFFF',
      },
    },

    // walletButton: {
    //   background: '#006AE3',
    //   color: '#202020',
    // },

    txModalColors: {
      background: '#191919',
      backgroundVariant: '#000000',
      onBackgroundVariant: '#202020',
      onBackgroundVariantB: '#202020',
      onBackgroundVariantColor: '#555555',
      primary: '#00A3FF',
      loading: '#FFA800',
      error: '#FF005E',
      warning: '#FFA800',
      success: '#C6E11E',
      text: '#888888',
      textContrast: '#FFFFFF',
    },
  },
};

export { darkTheme };
