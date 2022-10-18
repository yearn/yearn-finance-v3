import { FC, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';

import { useAppSelector, usePrevious } from '@hooks';
import { getTheme } from '@themes';
import { getConfig } from '@config';

export const Themable: FC = ({ children }) => {
  const { USE_VEYFI_ROUTES } = getConfig();
  const currentTheme = useAppSelector(({ theme }) => (USE_VEYFI_ROUTES ? 'light' : theme.current));
  const previousTheme = usePrevious(currentTheme);
  const theme = getTheme(currentTheme);

  useEffect(() => {
    if (currentTheme === previousTheme) return;
    if (currentTheme === 'system-prefs') {
      const { matches: prefersColorSchemeDark } = window?.matchMedia('(prefers-color-scheme: dark)');
      document.body.dataset.theme = prefersColorSchemeDark ? 'dark' : 'light';
    } else {
      document.body.dataset.theme = currentTheme;
    }
  }, [currentTheme]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
