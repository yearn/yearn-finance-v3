import 'styled-components';
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      card: string;
      error: string;

      shade0: string;
      shade20: string;
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
      shade40: string;
      shade90: string;
      shade100: string;
    };
    mobile: number;
    blade: {
      background: string;
      blur: string;
    };
    navbar: {
      padding: string;
      height: string;
    };
    saveAsset: {
      cardBackground: string;
      cardBackgroundSelected: string;
      cardBorder: string;
      cardBorderSelected: string;
    };
    zindex: {
      sidemenu: number;
      navSidemenu: number;
      onboardModal: number;
    };
    globalFont: string;
    globalMaxWidth: string;
  }
}
