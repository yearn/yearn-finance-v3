import { DefaultTheme } from 'styled-components';

const defaultTheme: DefaultTheme = {
  colors: {
    primary: '#0075FF',
    card: '#292D39',
    error: 'red',

    shade0: '#FFFFFF',
    shade20: '#A7A8AC',
    shade30: '#696D78',
    shade40: '#3F424A',
    shade90: '#22252E',
    shade100: '#00070E',
  },
  contrasts: {
    primary: '#FFF',
    card: '#FFF',
    error: '#FFF',

    shade0: '#000',
    shade20: '#FFF',
    shade30: '#FFF',
    shade40: '#FFF',
    shade90: '#FFF',
    shade100: '#FFF',
  },
  blade: {
    background: 'rgba(255, 255, 255, 0.2)',
    blur: '15px',
  },
  navbar: {
    padding: '2rem',
    height: '6.6rem',
  },
  footer: {
    padding: '7rem',
    paddingTop: '4rem',
    paddingBottom: '3.7rem',
  },
  chartTheme: {
    // background: '#292929',
    textColor: '#ffffff',
    fontSize: 11,
    axis: {
      domain: {
        line: {
          stroke: '#777777',
          strokeWidth: 1,
        },
      },
      ticks: {
        line: {
          stroke: '#adadad',
          strokeWidth: 1,
        },
      },
    },
    grid: {
      line: {
        stroke: '#dddddd',
        strokeWidth: 1,
      },
    },
  },
  saveAsset: {
    cardBackground: 'rgba(42, 46, 59, 0.85)',
    cardBackgroundSelected: 'rgba(52, 57, 73, 0.7)',
    cardBorder: 'rgba(66, 71, 86, 0.3)',
    cardBorderSelected: '#424756',
  },
  zindex: {
    navbar: 400,
    sidemenu: 500,
    navSidemenu: 1000,
    onboardModal: 1100,
  },
  devices: {
    mobile: 600,
    tablet: 960,
    desktopS: 1280,
    desktop: 1920,
    desktopL: 2560,
  },
  globalFont: '"Rubik", sans-serif',
  globalMaxWidth: '128rem',

  sideBar: {
    width: '16rem',
    collapsedWidth: '4.8rem',
  },
};

export const device = {
  mobile: `(max-width: ${defaultTheme.devices.mobile}px)`,
  tablet: `(max-width: ${defaultTheme.devices.tablet}px)`,
  desktopS: `(max-width: ${defaultTheme.devices.desktopS}px)`,
  desktop: `(max-width: ${defaultTheme.devices.desktop}px)`,
  desktopL: `(max-width: ${defaultTheme.devices.desktopL}px)`,
};

export { defaultTheme };
