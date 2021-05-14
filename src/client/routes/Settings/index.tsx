import styled from 'styled-components';

import { useAppSelector, useAppTranslation } from '@hooks';
import { AVAILABLE_THEMES, getTheme } from '@themes';
import { Theme } from '@types';

const SettingsView = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ThemeList = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const ThemeBox = styled.div<{ theme: string }>`
  display: flex;
  flex-direction: column;
`;

export const Settings = () => {
  const { t } = useAppTranslation('common');
  const currentTheme = useAppSelector(({ theme }) => theme.current);
  console.log(currentTheme);

  return (
    <SettingsView>
      Settings
      <ThemeList>
        {AVAILABLE_THEMES.map((theme) => (
          <ThemeBox theme={getTheme(theme)}>{t(`themes.${theme}`)}</ThemeBox>
        ))}
        {/* <ThemeBox theme="cyberpunk">Cyberpunk</ThemeBox> */}
      </ThemeList>
    </SettingsView>
  );
};
