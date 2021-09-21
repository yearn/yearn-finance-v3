import { DefaultTheme } from 'styled-components';

import { ClassicBackground } from '@assets/images';
import { sharedTheme } from '../default';

const classicTheme: DefaultTheme = {
  ...sharedTheme,
  background: {
    image: ClassicBackground,
  },
  colors: {
    primary: '#0A1D3F',
    background: '#1F255F',
    surface: '#0A1D3F',

    primaryVariant: '#b5b5b5',

    secondary: '#fff',
    secondaryVariantA: '#006AE3',
    secondaryVariantB: '#006AE3',

    surfaceVariantA: '#1F255F',
    surfaceVariantB: '#1F255F',

    selectionBar: '#006AE3',

    onPrimary: '#01E2A0',
    onPrimaryVariant: '#E5E5E5',
    onBackground: '#E5E5E5',

    onSurfaceH1: '#fff',
    onSurfaceH1Contrast: '#fff',
    onSurfaceH2: '#fff',
    onSurfaceH2Hover: '#fff',
    onSurfaceSH1: '#fff',
    onSurfaceSH1Hover: '#fff',

    upTrend: '#01E2A0',
    downTrend: '#EF1E02',

    vaultActionButton: {
      background: 'transparent',
      borderColor: '#fff',
      color: '#fff',
      disabledContrast: '0.1',

      selected: {
        background: 'transparent',
        borderColor: '#E5E5E5',
        color: '#E5E5E5',
      },
    },

    walletButton: {
      background: '#E5E5E5',
      color: '#006AE3',
    },

    txModalColors: {
      background: '#0A1D3F',
      backgroundVariant: '#1F255F',
      onBackgroundVariant: '#0A1D3F',
      onBackgroundVariantB: '#1F255F',
      onBackgroundVariantColor: '#fff',
      primary: '#006AE3',
      loading: '#FFA800',
      error: '#EF1E02',
      success: '#01E2A0',
      text: '#fff',
      textContrast: '#fff',
    },
  },
};

export { classicTheme };