import { FC } from 'react';
import { ThemeProvider } from 'styled-components';

import { useAppSelector } from '@hooks';
import { getTheme } from '@themes';

export const Themable: FC = ({ children }) => {
  const currentTheme = useAppSelector(({ theme }) => theme.current);
  const theme = getTheme(currentTheme);
  return (
    <ThemeProvider theme={theme}>
      <>{children}</>
    </ThemeProvider>
  );
};
