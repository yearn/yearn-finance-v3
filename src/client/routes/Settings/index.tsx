import styled from 'styled-components';

import { useAppTranslation, useAppSelector, useAppDispatch } from '@hooks';
import { ThemeActions, SettingsActions, SettingsSelectors } from '@store';
import { getTheme } from '@themes';
import { getConfig } from '@config';
import { Theme } from '@types';

import { ModalsActions } from '@store';

import { ThemesIcon, Icon, Button, ToggleButton, Input } from '@components/common';
import { ThemeBox } from '@components/app/Settings';

const SettingsView = styled.div`
  display: grid;
  margin-top: 1.6rem;
  gap: 3.2rem;
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
  gap: 1rem;
  align-items: center;
`;

export const Settings = () => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(({ theme }) => theme.current);
  const devModeSettings = useAppSelector(SettingsSelectors.selectDevModeSettings);
  const { ALLOW_DEV_MODE, AVAILABLE_THEMES } = getConfig();
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
      {ALLOW_DEV_MODE && (
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

      {ALLOW_DEV_MODE && (
        <>
          <SettingsSection>
            <SectionTitle>
              <SectionIcon Component={ThemesIcon} />
              Dev Mode
            </SectionTitle>
            <SectionContent>
              Enable Dev Mode
              <ToggleButton
                selected={devModeSettings.enabled}
                setSelected={() => dispatch(SettingsActions.toggleDevMode({ enable: !devModeSettings.enabled }))}
              />
            </SectionContent>
          </SettingsSection>
          {devModeSettings.enabled && (
            <SettingsSection>
              <SectionTitle />
              <SectionContent>
                Wallet Address Override
                <Input
                  value={devModeSettings.walletAddressOverride}
                  onChange={(e) => dispatch(SettingsActions.changeWalletAddressOverride({ address: e.target.value }))}
                />
              </SectionContent>
            </SettingsSection>
          )}
        </>
      )}
    </SettingsView>
  );
};
