import { DefaultTheme } from 'styled-components';

const defaultTheme: DefaultTheme = {
  colors: {
    primary: '#0075FF',

    shade0: '#FFFFFF',
    shade20: '#A7A8AC',
    shade40: '#3F424A',
    shade90: '#22252E',
    shade100: '#00070E',

    surface: '#292D39',
    onSurface: '#fff',
  },
  contrasts: {
    primary: '#FFFFFF',

    shade0: '#000',
    shade20: '#000',
    shade40: '#FFF',
    shade90: '#FFF',
    shade100: '#FFF',
  },
  mobile: 720,
  navbar: {
    padding: '2rem',
    height: '6.6rem',
  },
  zindex: {
    sidemenu: 500,
    navSidemenu: 1000,
    onboardModal: 1100,
  },
};

export { defaultTheme };
