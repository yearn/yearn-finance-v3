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
    disabled: '#CED5E3',
    icons: {
      primary: '#CED5E3',
      variant: '#475570',
      text: '#475570',
    },
    button: {
      filled: {
        primary: '#0657F9',
        variant: '#004ADF',
        text: '#FFFFFF',
      },
      outlined: {
        primary: '#FFFFFF',
        variant: '#E0EAFF',
        text: '#0657F9',
      },
      disabled: {
        primary: '#F4F7FB',
        text: '#CED5E3',
      },
    },
  },
};

// TODO Clean all themes variables, this is a mess right now, lots of unused vars
// and lots of unnecessary ones, if we can get an updated figma with matching vars on
// all the themes, these shouldn't be too difficult

const lightTheme: DefaultTheme = {
  ...sharedTheme,
  colors: {
    logo: light.colors.primary,

    primary: light.colors.primary,
    background: light.colors.background,
    surface: light.colors.surface,

    primaryVariant: light.colors.primaryVariant,

    secondary: light.colors.secondary,

    backgroundVariant: light.colors.backgroundVariant,
    icons: {
      primary: light.colors.icons.primary,
      variant: light.colors.icons.variant,
      text: light.colors.icons.text,
    },
    titles: light.colors.titles,
    titlesVariant: light.colors.titlesVariant,
    texts: light.colors.texts,
    surfaceVariant: light.colors.surfaceVariant,

    secondaryVariantA: '#000000',
    secondaryVariantB: '#000000',

    surfaceVariantA: '#E8E8EA',
    surfaceVariantB: '#000000',

    selectionBar: light.colors.surfaceVariant,

    onPrimaryVariant: '#000000',
    onBackground: '#000000',

    upTrend: '#A8C300',
    downTrend: '#FF005E',

    toggleSwitch: {
      background: 'white',
      color: light.colors.primary,

      selected: {
        background: light.colors.primary,
        color: 'white',
      },
    },

    vaultActionButton: {
      background: light.colors.secondary,
      borderColor: light.colors.secondary,
      color: light.colors.titlesVariant,
      iconFill: light.colors.backgroundVariant,
      // disabledContrast: '1',

      selected: {
        background: 'transparent',
        borderColor: '#FFFFFF',
        color: '#FFFFFF',
      },
    },

    txModalColors: {
      background: light.colors.surface,
      backgroundVariant: light.colors.background,
      onBackgroundVariantColor: '#6e6e6e',
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
      success: '#A8C300',
      text: light.colors.icons.variant,
      textContrast: light.colors.titles,
    },
  },
};

export { lightTheme };
