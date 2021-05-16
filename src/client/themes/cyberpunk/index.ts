import { DefaultTheme } from 'styled-components';
import { sharedTheme } from '../default';

const cyberpunkTheme: DefaultTheme = {
  ...sharedTheme,
  colors: {
    primary: '#0CA7C9',
    primaryVariant: '#7AF6FF',

    secondary: '#D35290',
    secondaryVariantA: '#BB6FA1',
    secondaryVariantB: '#FBD282',

    onPrimary: '#0CA7C9',
    onPrimaryVariant: '#FBD282',

    background: '#3D305F',
    onBackground: '#FBD282',

    surface: '#523C6E',
    surfaceVariant: '#594177',
    onSurface: '#D35290',
    onSurfaceVariantA: '#BB6FA1',
    onSurfaceVariantB: '#0CA7C9',

    upTrend: '#ADFF00',
    downTrend: '#FF002F',

    hoverHbar: '#D35290',
  },
};

export { cyberpunkTheme };
