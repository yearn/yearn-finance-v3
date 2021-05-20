import 'styled-components';
declare module 'styled-components' {
  export interface SharedTheme {
    oldColors: {
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
    };

    layoutPadding: string;
  }

  // TODO Restructure theme and generic vars shared between themes
  export interface DefaultTheme extends SharedTheme {
    colors: {
      primary: string;
      primaryVariant: string;

      secondary: string;
      secondaryVariantA: string;
      secondaryVariantB: string;

      onPrimary: string;
      onPrimaryVariant: string;

      background: string;
      onBackground: string;

      surface: string;
      surfaceVariant: string;
      onSurface: string;
      onSurfaceVariantA: string;
      onSurfaceVariantB: string;

      upTrend: string;
      downTrend: string;

      hoverHbar: string;
    };
  }

  // TODO Restructure theme and generic vars shared between themes
  export interface DefaultTheme extends SharedTheme {
    colors: {
      primary: string;
      primaryVariant: string;

      secondary: string;
      secondaryVariantA: string;
      secondaryVariantB: string;

      onPrimary: string;
      onPrimaryVariant: string;

      background: string;
      onBackground: string;

      surface: string;
      surfaceVariant: string;
      onSurface: string;
      onSurfaceVariantA: string;
      onSurfaceVariantB: string;

      upTrend: string;
      downTrend: string;

      hoverHbar: string;
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
