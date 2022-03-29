import { DefaultTheme } from 'styled-components';

import { sharedTheme } from '../default';

import ExplorerBackground from './background.jpg';

const explorerTheme: DefaultTheme = {
  ...sharedTheme,

  background: {
    image: ExplorerBackground,
    position: 'right center',
  },

  colors: {
    logo: '#AD3235',

    primary: '#AD3235',
    background: '#cfa368',
    surface: 'rgba(173, 50, 53, 0.5)',

    primaryVariant: '#9e9e9e',

    secondary: '#FFF',

    backgroundVariant: '#cfa368',
    icons: {
      primary: '#AD3235',
      variant: '#FFF',
    },
    titles: '#FFF',
    titlesVariant: '#AD3235',
    texts: '#FFF',
    surfaceVariant: '#FFF',

    secondaryVariantA: 'rgba(173, 50, 53, 0.5)',
    secondaryVariantB: '#006AE3',

    surfaceVariantA: 'rgba(173, 50, 53, 0.5)',
    surfaceVariantB: '#1F255F',

    selectionBar: '#AD3235',

    onPrimaryVariant: '#fff',
    onBackground: '#E5E5E5',

    toggleSwitch: {
      background: 'transparent',
      color: '#E5E5E5',

      selected: {
        background: '#C6E11E',
        color: 'white',
      },
    },

    upTrend: '#01E2A0',
    downTrend: '#EF1E02',

    vaultActionButton: {
      background: 'transparent',
      borderColor: '#eeeeee',
      color: '#eeeeee',
      // disabledContrast: '',

      selected: {
        background: 'transparent',
        borderColor: '#F59E3D',
        color: '#F59E3D',
      },
    },

    // walletButton: {
    //   background: '#212121',
    //   color: '#eeeeee',
    // },

    txModalColors: {
      background: 'rgba(173, 50, 53, 0.5)',
      backgroundVariant: '#cfa368',
      onBackgroundVariantColor: '#212121',
      primary: '#FFA800',
      onPrimary: '#FFFFFF',
      loading: '#9f1431',
      error: '#EF1E02',
      warning: '#FFA800',
      success: '#01E2A0',
      text: '#eeeeee',
      textContrast: '#212121',
    },
  },
};

export { explorerTheme };
