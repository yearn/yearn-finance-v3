import { DefaultTheme } from 'styled-components';

import { sharedTheme } from '../default';

import ClassicBackground from './background.jpg';

// TODO Dehardcode this
const classic = {
  name: 'classic',
  colors: {
    background: '#012A7C',
    backgroundVariant: '#001E59',
    surface: '#001746',
    surfaceVariant: '#012A7C',
    primary: '#0657F9',
    primaryVariant: '#004ADF',
    secondary: '#0657F9',
    titles: '#FFFFFF',
    titlesVariant: '#FFFFFF',
    texts: '#7F8DA9',
    disabled: '#CED5E3',
    icons: {
      primary: '#7F8DA9',
      variant: '#FFFFFF',
    },
    button: {
      filled: {
        primary: '#0657F9',
        variant: '#004ADF',
        text: '#FFFFFF',
      },
      outlined: {
        primary: '#0657F9',
        variant: '#012A7C',
        text: '#0657F9',
      },
      disabled: {
        primary: '#012A7C',
        text: '#7F8DA9',
      },
    },
  },
};

const classicTheme: DefaultTheme = {
  ...sharedTheme,
  background: {
    image: ClassicBackground,
  },
  colors: {
    logo: '#006AE3',

    primary: classic.colors.primary,
    background: classic.colors.background,
    surface: classic.colors.surface,

    primaryVariant: classic.colors.primaryVariant,

    secondary: classic.colors.secondary,

    backgroundVariant: classic.colors.backgroundVariant,
    icons: {
      primary: classic.colors.icons.primary,
      variant: classic.colors.icons.variant,
    },
    titles: classic.colors.titles,
    titlesVariant: classic.colors.titlesVariant,
    texts: classic.colors.texts,
    surfaceVariant: classic.colors.surfaceVariant,

    secondaryVariantA: '#006AE3',
    secondaryVariantB: '#006AE3',

    surfaceVariantA: '#1F255F',
    surfaceVariantB: '#1F255F',

    selectionBar: '#006AE3',

    onPrimaryVariant: '#E5E5E5',
    onBackground: '#E5E5E5',

    toggleSwitch: {
      background: 'transparent',
      color: classic.colors.primary,

      selected: {
        background: '#01E2A0',
        color: classic.colors.primary,
      },
    },

    upTrend: '#01E2A0',
    downTrend: '#EF1E02',

    vaultActionButton: {
      background: 'transparent',
      borderColor: '#fff',
      color: '#fff',
      // disabledContrast: '0.1',

      selected: {
        background: 'transparent',
        borderColor: '#E5E5E5',
        color: '#E5E5E5',
      },
    },

    txModalColors: {
      background: classic.colors.surface,
      backgroundVariant: '#1F255F',
      onBackgroundVariantColor: '#fff',
      primary: '#006AE3',
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
      success: '#01E2A0',
      text: '#fff',
      textContrast: '#fff',
    },
  },
};

export { classicTheme };
