import { DefaultTheme } from 'styled-components';

import { sharedTheme } from '../default';

const lightNew = {
  name: 'light-new',
  colors: {
    background: '#FFFFFF',
    backgroundVariant: '#0C0C0C',
    surface: '#F4F4F4',
    surfaceVariant: '#E1E1E1',
    primary: '#0C0C0C',
    primaryVariant: '#004ADF',
    secondary: '#0C0C0C',
    titles: '#0C0C0C',
    titlesVariant: '#0C0C0C',
    texts: '#5B5B5B',
    textsVariant: '#7F8DA9',
    textsSecondary: '#A8A8A8',
    disabled: '#CED5E3',
    icons: {
      primary: '#CED5E3',
      variant: '#475570',
      text: '#475570',
    },
    button: {
      filled: {
        primary: '#0C0C0C',
        variant: '#004ADF',
        text: '#FFFFFF',
      },
      outlined: {
        primary: '#FFFFFF',
        variant: '#E0EAFF',
        text: '#0C0C0C',
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

const lightNewTheme: DefaultTheme = {
  ...sharedTheme,
  globalFont: 'Aeonik, sans-serif',
  alerts: {
    ...sharedTheme.alerts,
    warning: {
      background: '#FFEEA9',
      color: '#EA5204',
    },
  },
  colors: {
    logo: lightNew.colors.primary,

    primary: lightNew.colors.primary,
    background: lightNew.colors.background,
    surface: lightNew.colors.surface,

    primaryVariant: lightNew.colors.primaryVariant,

    secondary: lightNew.colors.secondary,

    backgroundVariant: lightNew.colors.backgroundVariant,
    icons: {
      primary: lightNew.colors.icons.primary,
      variant: lightNew.colors.icons.variant,
      text: lightNew.colors.icons.text,
    },
    titles: lightNew.colors.titles,
    titlesVariant: lightNew.colors.titlesVariant,
    texts: lightNew.colors.texts,
    textsVariant: lightNew.colors.textsVariant,
    textsSecondary: lightNew.colors.textsSecondary,
    surfaceVariant: lightNew.colors.surfaceVariant,

    secondaryVariantA: '#000000',
    secondaryVariantB: '#000000',

    surfaceVariantA: '#E8E8EA',
    surfaceVariantB: '#000000',

    selectionBar: lightNew.colors.surfaceVariant,

    onPrimaryVariant: '#000000',
    onBackground: '#000000',

    upTrend: '#A8C300',
    downTrend: '#FF005E',

    toggleSwitch: {
      background: 'white',
      color: lightNew.colors.primary,

      selected: {
        background: lightNew.colors.primary,
        color: 'white',
      },
    },

    vaultActionButton: {
      background: lightNew.colors.secondary,
      borderColor: lightNew.colors.secondary,
      color: lightNew.colors.titlesVariant,
      iconFill: lightNew.colors.backgroundVariant,
      // disabledContrast: '1',

      selected: {
        background: 'transparent',
        borderColor: '#FFFFFF',
        color: '#FFFFFF',
      },
    },

    txModalColors: {
      background: lightNew.colors.surface,
      backgroundVariant: lightNew.colors.background,
      onBackgroundVariantColor: '#6e6e6e',
      primary: '#0657F9',
      onPrimary: '#FFFFFF',
      loading: '#FFA800',
      error: {
        backgroundColor: '#FFD9D9',
        color: '#FF0000',
      },
      warning: {
        backgroundColor: '#FFEEA9',
        color: '#EA5204',
      },
      success: '#A8C300',
      text: lightNew.colors.icons.variant,
      textContrast: lightNew.colors.titles,
    },

    button: {
      disabled: {
        borderColor: lightNew.colors.disabled,
        backgroundColor: lightNew.colors.surface,
        color: lightNew.colors.button.disabled.text,
      },
    },

    input: {
      placeholder: '#5B5B5B',
    },
  },
};

export { lightNewTheme };
