import { SharedTheme } from 'styled-components';

const sharedTheme: SharedTheme = {
  blade: {
    background: 'rgba(255, 255, 255, 0.2)',
    blur: '15px',
  },
  navbar: {
    height: '6.6rem',
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
    modals: 1099,
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
  globalMaxWidth: '120rem',

  sideBar: {
    width: '16rem',
    collapsedWidth: '4.8rem',
    animation: '200ms ease-in-out',
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
