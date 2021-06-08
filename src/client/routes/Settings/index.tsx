import styled from 'styled-components';

import { useAppTranslation, useAppSelector, useAppDispatch } from '@hooks';
import { ThemeActions, SettingsActions, SettingsSelectors } from '@store';
import { getTheme } from '@themes';
import { getConfig } from '@config';
import { Theme } from '@types';

import { ModalsActions } from '@store';

import {
  ThemesIcon,
  ClockIcon,
  Icon,
  Button,
  ToggleButton,
  Input,
  Card,
  CardHeader,
  CardContent,
} from '@components/common';
import { ThemeBox } from '@components/app/Settings';
import { ViewContainer } from '@components/app';

const sectionsGap = '2.2rem';
const sectionsBorderRadius = '0.8rem';

const SettingsView = styled(ViewContainer)``;

const SettingsCardHeader = styled(CardHeader)`
  margin-bottom: 1.2rem;
`;

const SettingsCardContent = styled(CardContent)`
  flex-direction: column;
  align-items: flex-start;
`;

const SettingsCard = styled(Card)`
  display: grid;
  padding-left: 0;
  padding-right: 0;
`;

const SettingsSection = styled.div`
  display: grid;
  grid-template-columns: 18rem 1fr;
  padding: 0 ${({ theme }) => theme.cardPadding};
  gap: 1.5rem;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: flex-start;
  color: ${({ theme }) => theme.colors.secondary};
  fill: ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.surfaceVariantA};
  padding: ${({ theme }) => theme.cardPadding};

  ${SettingsSection}:not(:first-child) & {
    padding-top: ${sectionsGap};
  }
  ${SettingsSection}:first-child & {
    border-top-left-radius: ${sectionsBorderRadius};
    border-top-right-radius: ${sectionsBorderRadius};
  }
  ${SettingsSection}:last-child & {
    border-bottom-left-radius: ${sectionsBorderRadius};
    border-bottom-right-radius: ${sectionsBorderRadius};
  }
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

  padding-top: ${sectionsGap};
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
      <SettingsCard>
        <SettingsCardHeader header={t('settings.preferences')} />

        <SettingsCardContent>
          <SettingsSection>
            <SectionTitle>
              <SectionIcon Component={ClockIcon} />
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
                      onChange={(e) =>
                        dispatch(SettingsActions.changeWalletAddressOverride({ address: e.target.value }))
                      }
                    />
                  </SectionContent>
                </SettingsSection>
              )}
            </>
          )}
        </SettingsCardContent>
      </SettingsCard>
    </SettingsView>
  );
};
