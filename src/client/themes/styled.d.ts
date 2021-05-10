import 'styled-components';
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      card: string;
      error: string;

      shade0: string;
      shade20: string;
      shade30: string;
      shade40: string;
      shade90: string;
      shade100: string;
    };
    contrasts: {
      primary: string;
      card: string;
      error: string;

      shade0: string;
      shade20: string;
      shade30: string;
      shade40: string;
      shade90: string;
      shade100: string;
    };
    blade: {
      background: string;
      blur: string;
    };
    navbar: {
      padding: string;
      height: string;
    };
    footer: {
      padding: string;
      paddingTop: string;
      paddingBottom: string;
    };
    chartTheme: any;
    saveAsset: {
      cardBackground: string;
      cardBackgroundSelected: string;
      cardBorder: string;
      cardBorderSelected: string;
    };
    zindex: {
      navbar: number;
      sidemenu: number;
      navSidemenu: number;
      onboardModal: number;
    };
    devices: Devices;
    globalFont: string;
    globalMaxWidth: string;

    sideBar: {
      width: string;
      collapsedWidth: string;
    };
  }

  export interface Devices {
    mobile: number;
    tablet: number;
    desktopS: number;
    desktop: number;
    desktopL: number;
  }
}
