import styled from 'styled-components';

import { useAppTranslation, useAppSelector, useAppDispatch } from '@hooks';
import { ThemeActions } from '@store';
import { AVAILABLE_THEMES, getTheme } from '@themes';
import { Theme } from '@types';

import { ModalsActions } from '@store';

import { ThemesIcon, Icon, Button } from '@components/common';
import { ThemeBox } from '@components/app/Settings';

const SettingsView = styled.div`
  display: grid;
  margin-top: 1.6rem;
  grid-gap: 3.2rem;
`;

const SettingsSection = styled.div`
  display: grid;
  grid-template-columns: 20rem 1fr;
  align-items: flex-start;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.secondary};
  fill: ${({ theme }) => theme.colors.secondary};
`;

const SectionIcon = styled(Icon)`
  fill: inherit;
  margin-right: 0.7rem;
`;

const SectionContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  grid-gap: 1rem;
`;

export const Settings = () => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(({ theme }) => theme.current);

  const changeTheme = (theme: Theme) => dispatch(ThemeActions.changeTheme({ theme }));

  const openTestModal = () => {
    dispatch(ModalsActions.openModal({ modalName: 'test', modalProps: { testVar: 'test variable' } }));
  };

  return (
    <SettingsView>
      <SettingsSection>
        <SectionTitle>
          <SectionIcon Component={ThemesIcon} />
          Slipped tolerance
        </SectionTitle>
        <SectionContent>TBD</SectionContent>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>
          <SectionIcon Component={ThemesIcon} />
          {t('settings.themes')}
        </SectionTitle>

        <SectionContent>
          {AVAILABLE_THEMES.map((theme: Theme, index) => (
            <ThemeBox
              themePallete={getTheme(theme)}
              name={theme}
              key={index}
              selected={theme === currentTheme}
              onClick={() => changeTheme(theme)}
            />
          ))}
        </SectionContent>
      </SettingsSection>

      {/* Only on development for testing! */}
      {process.env.NODE_ENV === 'development' && (
        <SettingsSection>
          <SectionTitle>
            <SectionIcon Component={ThemesIcon} />
            Testing space
          </SectionTitle>
          <SectionContent>
            <Button onClick={openTestModal}>Open test modal</Button>
          </SectionContent>
        </SettingsSection>
      )}
    </SettingsView>
  );
};
