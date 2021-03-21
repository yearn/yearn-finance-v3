import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      surface: string;
      background: string;
      error: string;
      onPrimary: string;
      onSecondary: string;
      onSurface: string;
      onBackground: string;
      onError: string;
      black: string;
      white: string;
      text: string;
    };
    fontFamily: string;
    fonts: Array<string>;
    fontSizes: Array<number>;
    fontWeights: Array<number>;
    space: Array<number>;
  }
}
