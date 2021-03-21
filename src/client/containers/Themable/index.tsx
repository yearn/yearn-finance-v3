import { FC } from 'react';
import { ThemeProvider } from 'styled-components';

import { useAppSelector } from '@hooks';
import { getTheme } from '@themes';

export const Themable: FC = ({ children }) => {
  const selectedTheme = useAppSelector(({ theme }) => theme);
  const theme = getTheme(selectedTheme.current);
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
