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
    alerts: 1200,
  },
  devices: {
    mobile: 600,
    tablet: 960,
    desktopS: 1280,
    desktop: 1920,
    desktopL: 2560,
  },
  globalFont: '"SF Pro Display", sans-serif',
  globalMaxWidth: '102rem',
  globalRadius: '0.8rem',

  sideBar: {
    width: '16rem',
    collapsedWidth: '4.8rem',
    animation: '200ms ease-in-out',
  },

  alerts: {
    default: {
      background: 'black',
      color: 'white',
    },
    info: {
      background: 'blue',
      color: 'white',
    },
    success: {
      background: 'green',
      color: 'white',
    },
    error: {
      background: 'red',
      color: 'white',
    },
  },

  txModal: {
    width: '38.4rem',
    gap: '1.2rem',
  },

  searchList: {
    primary: '#00A3FF',
    primaryVariant: '#006AE3',
    primaryHover: '#00D1FF',
    onPrimary: '#FFFFFF',
  },

  layoutPadding: '1.6rem',
  cardPadding: '1.2rem',
};

export const device = {
  mobile: `(max-width: ${sharedTheme.devices.mobile}px)`,
  tablet: `(max-width: ${sharedTheme.devices.tablet}px)`,
  desktopS: `(max-width: ${sharedTheme.devices.desktopS}px)`,
  desktop: `(max-width: ${sharedTheme.devices.desktop}px)`,
  desktopL: `(max-width: ${sharedTheme.devices.desktopL}px)`,
};

export { sharedTheme };
