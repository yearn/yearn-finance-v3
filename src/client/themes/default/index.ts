import { SharedTheme } from 'styled-components';

const sharedTheme: SharedTheme = {
  oldColors: {
    primary: '#000000',
    card: '#292D39',
    error: 'red',

    shade0: '#00070E',
    shade20: '#22252E',
    shade30: '#3F424A',
    shade40: '#696D78',
    shade90: '#A7A8AC',
    shade100: '#FFFFFF',
  },
  contrasts: {
    primary: '#FFF',
    card: '#FFF',
    error: '#FFF',

    shade0: '#FFF',
    shade20: '#FFF',
    shade30: '#FFF',
    shade40: '#FFF',
    shade90: '#FFF',
    shade100: '#000',
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

  layoutPadding: '1.6rem',
};

export const device = {
  mobile: `(max-width: ${sharedTheme.devices.mobile}px)`,
  tablet: `(max-width: ${sharedTheme.devices.tablet}px)`,
  desktopS: `(max-width: ${sharedTheme.devices.desktopS}px)`,
  desktop: `(max-width: ${sharedTheme.devices.desktop}px)`,
  desktopL: `(max-width: ${sharedTheme.devices.desktopL}px)`,
};

export { sharedTheme };
