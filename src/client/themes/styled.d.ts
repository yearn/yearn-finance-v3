import 'styled-components';

declare module 'styled-components' {
  export interface SharedTheme {
    background?: {
      image: string;
      position?: string;
    };

    blade: {
      background: string;
      blur: string;
    };
    navbar: {
      height: string;
    };
    zindex: {
      navbar: number;
      sidemenu: number;
      tooltips: number;
      navSidemenu: number;
      modals: number;
      onboardModal: number;
      alerts: number;
    };
    devices: Devices;
    globalFont: string;
    globalMaxWidth: string;
    globalRadius: string;

    sideBar: {
      width: string;
      collapsedWidth: string;
      animation: string;
    };
    tabbar: {
      height: string;
    };

    alerts: {
      default: {
        background: string;
        color: string;
      };
      info: {
        background: string;
        color: string;
      };
      success: {
        background: string;
        color: string;
      };
      error: {
        background: string;
        color: string;
      };
      warning: {
        background: string;
        color: string;
      };
    };

    txModal: {
      width: string;
      gap: string;
    };

    searchList: {
      primary: string;
      primaryVariant: string;
      primaryHover: string;
      onPrimary: string;
    };

    layoutPadding: string;
    card: {
      padding: string;
    };
  }

  // TODO Restructure theme and generic vars shared between themes
  export interface DefaultTheme extends SharedTheme {
    colors: {
      logo: string;

      primary: string;
      background: string;
      backgroundVariant: string;
      surface: string;

      primaryVariant: string;

      secondary: string;

      // START REWORK
      icons: {
        primary: string;
        variant: string;
      };
      titles: string;
      titlesVariant: string;
      texts: string;
      textsVariant: string;
      surfaceVariant: string;
      // END REWORK

      secondaryVariantA: string;
      secondaryVariantB: string;

      surfaceVariantA: string;
      surfaceVariantB: string;

      selectionBar: string;

      onPrimaryVariant: string;
      onBackground: string;

      upTrend: string;
      downTrend: string;

      toggleSwitch: {
        background: string;
        color: string;

        selected: {
          background: string;
          color: string;
        };
      };

      vaultActionButton: {
        background: string;
        borderColor: string;
        color: string;
        iconFill: string;
        // disabledContrast: string;

        selected: {
          background: string;
          borderColor: string;
          color: string;
        };
      };

      txModalColors: {
        background: string;
        backgroundVariant: string;
        onBackgroundVariantColor: string;
        primary: string;
        onPrimary: string;
        loading: string;
        error: {
          backgroundColor: string;
          color: string;
        };
        warning: {
          backgroundColor: string;
          color: string;
        };
        success: string;
        text: string;
        textContrast: string;
      };
    };
  }

  export interface Devices {
    mobile: number;
    tablet: number;
    tabletL: number;
    desktopS: number;
    desktop: number;
    desktopL: number;
  }
}
