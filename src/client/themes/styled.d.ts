import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;

      shade0: string;
      shade40: string;
      shade90: string;
      shade100: string;
    };
    mobile: number;
    navbarHeight: string;
  }
}
