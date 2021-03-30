import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;

      shade0: string;
      shade40: string;
      shade90: string;
      shade100: string;
      // secondary: string;
      // surface: string;
      // background: string;
      // error: string;
      // onPrimary: string;
      // onSecondary: string;
      // onSurface: string;
      // onBackground: string;
      // onError: string;
      // black: string;
      // white: string;
      // text: string;
    };
    mobile: number;
    navbarHeight: string;
    // fontFamily: string;
    // fonts: Array<string>;
    // fontSizes: Array<number>;
    // fontWeights: Array<number>;
    // space: Array<number>;
  }
}
