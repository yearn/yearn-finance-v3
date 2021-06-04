import 'styled-components';
declare module 'styled-components' {
  export interface SharedTheme {
    blade: {
      background: string;
      blur: string;
    };
    navbar: {
      height: string;
    };
    chartTheme: any;
    zindex: {
      navbar: number;
      sidemenu: number;
      navSidemenu: number;
      modals: number;
      onboardModal: number;
    };
    devices: Devices;
    globalFont: string;
    globalMaxWidth: string;

    sideBar: {
      width: string;
      collapsedWidth: string;
      animation: string;
    };

    layoutPadding: string;
  }

  // TODO Restructure theme and generic vars shared between themes
  export interface DefaultTheme extends SharedTheme {
    colors: {
      primary: string;
      background: string;
      surface: string;

      primaryVariant: string;

      secondary: string;
      secondaryVariantA: string;
      secondaryVariantB: string;

      surfaceVariantA: string;
      surfaceVariantB: string;

      selectionBar: string;

      onPrimary: string;
      onPrimaryVariant: string;
      onBackground: string;

      onSurfaceH1: string;
      onSurfaceH1Contrast: string;
      onSurfaceH2: string;
      onSurfaceH2Hover: string;
      onSurfaceSH1: string;
      onSurfaceSH1Hover: string;

      upTrend: string;
      downTrend: string;

      vaultActionButton: {
        background: string;
        borderColor: string;
        color: string;
      };

      walletButton: {
        background: string;
        color: string;
      };

      modalColors: {
        background: string;
        backgroundVariant: string;
        primary: string;
        text: string;
        textContrast: string;
      };
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
