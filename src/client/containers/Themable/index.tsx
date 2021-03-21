import { FC } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components';

import { getTheme } from '@themes';
import { RootState } from '@types';

export const Themable: FC = ({ children }) => {
  const selectedTheme = useSelector(({ theme }: RootState) => theme);
  const theme = getTheme(selectedTheme.current);
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
