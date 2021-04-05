import { DefaultTheme } from 'styled-components';

const defaultTheme: DefaultTheme = {
  colors: {
    primary: '#0075FF',
    card: '#292D39',
    error: 'red',

    shade0: '#FFFFFF',
    shade20: '#A7A8AC',
    shade40: '#3F424A',
    shade90: '#22252E',
    shade100: '#00070E',
  },
  contrasts: {
    primary: '#FFF',
    card: '#FFF',
    error: '#FFF',

    shade0: '#000',
    shade20: '#000',
    shade40: '#FFF',
    shade90: '#FFF',
    shade100: '#FFF',
  },
  mobile: 720,
  blade: {
    background: 'rgba(255, 255, 255, 0.2)',
    blur: '15px',
  },
  navbar: {
    padding: '2rem',
    height: '6.6rem',
  },
  saveAsset: {
    cardBackground: 'rgba(42, 46, 59, 0.85)',
    cardBackgroundSelected: 'rgba(52, 57, 73, 0.7)',
    cardBorder: 'rgba(66, 71, 86, 0.3)',
    cardBorderSelected: '#424756',
  },
  zindex: {
    sidemenu: 500,
    navSidemenu: 1000,
    onboardModal: 1100,
  },
  globalFont: '"Rubik", sans-serif',
  globalMaxWidth: '128rem',
};

export { defaultTheme };
