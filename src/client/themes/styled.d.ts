import 'styled-components';
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;

      shade0: string;
      shade20: string;
      shade40: string;
      shade90: string;
      shade100: string;
    };
    contrasts: {
      primary: string;

      shade0: string;
      shade20: string;
      shade40: string;
      shade90: string;
      shade100: string;
    };
    mobile: number;
    navbar: {
      padding: string;
      height: string;
    };
    zindex: {
      sidemenu: number;
      navSidemenu: number;
      onboardModal: number;
    };
  }
}
