import { useEffect, useState } from 'react';
import i18n from 'i18next';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { useAppTranslation, useAppSelector, useAppDispatch, useWindowDimensions } from '@hooks';
import { ThemeActions, SettingsActions, SettingsSelectors, AlertsActions, ModalsActions } from '@store';
import { getTheme } from '@themes';
import { device } from '@themes/default';
import { getConfig } from '@config';
import { AlertTypes, ModalName, Theme, Language } from '@types';
import { formatPercent, getCurrentLanguage } from '@utils';
import { ViewContainer, ThemeBox, CustomThemeButton } from '@components/app';
import {
  ThemesIcon,
  WorldIcon,
  ClockIcon,
  SettingsIcon,
  Icon,
  Button,
  ToggleButton,
  Input,
  Card,
  CardHeader,
  CardContent,
  OptionList,
} from '@components/common';

const sectionsGap = '2.2rem';
const sectionsBorderRadius = '0.8rem';

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
  width: 100%;
`;

const SettingsSection = styled.div`
  display: grid;
  grid-template-columns: 18rem 1fr;
  padding: 0 ${({ theme }) => theme.card.padding};
  grid-gap: 1.5rem;
`;

const SectionContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  grid-gap: 1.2rem;
  align-items: center;

  ${SettingsSection}:not(:first-child) & {
    padding-top: ${sectionsGap};
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: flex-start;
  fill: ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.surfaceVariantA};
  padding: ${({ theme }) => theme.card.padding};

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
  display: inline-block;
  fill: inherit;
  margin-right: 0.7rem;
`;

const SectionHeading = styled.h3`
  color: ${({ theme }) => theme.colors.secondary};
  display: inline-block;
  font-size: 1.6rem;
  font-weight: 500;
  margin: 0;
  padding: 0;
`;

const SlippageOption = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6.4rem;
  height: 6.4rem;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.globalRadius};
  cursor: pointer;

  ${({ active, theme }) =>
    active &&
    `
    background-color: ${theme.colors.secondary};
    color: ${theme.colors.surface};
  `}
`;

const SettingsView = styled(ViewContainer)`
  @media ${device.mobile} {
    ${SettingsCardContent} {
      gap: 2rem;
    }
    ${SettingsSection} {
      grid-template-columns: 1fr;
      width: 100%;
      padding: 0;

      :not(:first-child) ${SectionTitle} {
        padding-top: ${({ theme }) => theme.card.padding};
      }
      :not(:first-child) ${SectionContent} {
        padding-top: 0;
      }

      :first-child ${SectionTitle}, :last-child ${SectionTitle} {
        border-radius: 0;
      }
    }
    ${SectionContent} {
      padding: 0 ${({ theme }) => theme.card.padding};
    }
  }
`;

export const Settings = () => {
  const { t } = useAppTranslation(['common', 'settings']);
  const { isTablet } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const currentTheme = useAppSelector(({ theme }) => theme.current);
  const devModeSettings = useAppSelector(SettingsSelectors.selectDevModeSettings);
  const defaultSlippage = useAppSelector(SettingsSelectors.selectDefaultSlippage);
  const collapsedSidebar = useAppSelector(SettingsSelectors.selectSidebarCollapsed);
  const signedApprovalsEnabled = useAppSelector(SettingsSelectors.selectSignedApprovalsEnabled);

  const availableSlippages = getConfig().SLIPPAGE_OPTIONS;
  const { ALLOW_DEV_MODE, AVAILABLE_THEMES, AVAILABLE_CUSTOM_THEMES, SUPPORTED_LANGS } = getConfig();

  const currentLang = getCurrentLanguage().toString();
  const [dropdownSelectedLanguage, setDropdownSelectedLanguage] = useState({
    value: currentLang,
    label: t(`languages.${currentLang}`),
  });

  const dropdownLanguageOptions = SUPPORTED_LANGS.map((lang: Language) => {
    return { value: lang, label: t(`languages.${lang}`) };
  });

  const changeLanguage = (dropdownOption: { value: string; label: string }) => {
    setDropdownSelectedLanguage(dropdownOption);
    i18n.changeLanguage(dropdownOption.value);
  };

  const changeTheme = (theme: Theme) => dispatch(ThemeActions.changeTheme({ theme }));

  const isCustomThemeSelected = AVAILABLE_CUSTOM_THEMES.includes(currentTheme);

  const toggleSignedApprovals = () => {
    dispatch(SettingsActions.toggleSignedApprovals());
  };

  const changeSlippage = (slippage: number) => {
    dispatch(SettingsActions.setDefaultSlippage({ slippage }));
  };

  const toggleSidebar = () => {
    dispatch(SettingsActions.toggleSidebar());
  };

  const openModal = (modalName: ModalName, modalProps?: any) => {
    dispatch(ModalsActions.openModal({ modalName, modalProps }));
  };

  const openVault = (address: string) => {
    history.push(`/vault/${address}`);
  };

  const openAlert = (message: string, type?: AlertTypes, persistent?: boolean) => {
    dispatch(AlertsActions.openAlert({ message, type, persistent }));
  };

  useEffect(() => {
    setDropdownSelectedLanguage({ value: currentLang, label: t(`languages.${currentLang}`) });
  }, [currentLang]);

  return (
    <SettingsView>
      <SettingsCard>
        <SettingsCardHeader header={t('settings:preferences')} />

        <SettingsCardContent>
          <SettingsSection>
            <SectionTitle>
              <SectionHeading>
                <SectionIcon Component={SettingsIcon} />
                {t('settings:signed-approvals')}
              </SectionHeading>
            </SectionTitle>

            <SectionContent>
              <ToggleButton selected={signedApprovalsEnabled} setSelected={toggleSignedApprovals} />
            </SectionContent>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>
              <SectionHeading>
                <SectionIcon Component={ClockIcon} />
                {t('settings:slippage-tolerance')}
              </SectionHeading>
            </SectionTitle>
            <SectionContent>
              {availableSlippages.map((slippage) => (
                <SlippageOption
                  onClick={() => changeSlippage(slippage)}
                  active={slippage === defaultSlippage}
                  key={`s-${slippage}`}
                >
                  {formatPercent(slippage.toString(), 0)}
                </SlippageOption>
              ))}
            </SectionContent>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>
              <SectionHeading>
                <SectionIcon Component={ThemesIcon} />
                {t('settings:themes')}
              </SectionHeading>
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

              {isCustomThemeSelected && <ThemeBox themePallete={getTheme(currentTheme)} name={currentTheme} selected />}

              {!!AVAILABLE_CUSTOM_THEMES.length && <CustomThemeButton onClick={() => openModal('communityThemes')} />}
            </SectionContent>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>
              <SectionHeading>
                <SectionIcon Component={WorldIcon} />
                {t('settings:language')}
              </SectionHeading>
            </SectionTitle>

            <SectionContent>
              <OptionList
                selected={dropdownSelectedLanguage}
                setSelected={changeLanguage}
                options={dropdownLanguageOptions}
                listPosition={isTablet ? 'top' : 'bottom'}
              />
            </SectionContent>
          </SettingsSection>

          {ALLOW_DEV_MODE && (
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
          )}

          {/* Only on development settings for testing! */}
          {ALLOW_DEV_MODE && devModeSettings.enabled && (
            <>
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

              <SettingsSection>
                <SectionTitle>
                  <SectionIcon Component={ThemesIcon} />
                  Additional settings
                </SectionTitle>
                <SectionContent>
                  Expanded sidenav
                  <ToggleButton selected={!collapsedSidebar} setSelected={toggleSidebar} />
                </SectionContent>
              </SettingsSection>

              <SettingsSection>
                <SectionTitle>
                  <SectionIcon Component={ThemesIcon} />
                  Modals testing
                </SectionTitle>
                <SectionContent>
                  <Button onClick={() => openModal('test', { testVar: 'test variable' })}>Open test modal</Button>
                  <Button onClick={() => openModal('testTx')}>Open TestTx modal</Button>
                  <Button onClick={() => openModal('comingSoon')}>Open ComingSoon modal</Button>
                  <Button onClick={() => openVault('0xdA816459F1AB5631232FE5e97a05BBBb94970c95')}>
                    Open DAI Vault details
                  </Button>
                </SectionContent>
              </SettingsSection>

              <SettingsSection>
                <SectionTitle>
                  <SectionIcon Component={ThemesIcon} />
                  Alerts testing
                </SectionTitle>
                <SectionContent>
                  <Button onClick={() => openAlert('Default alert')}>Open default alert</Button>
                  <Button onClick={() => openAlert('Success alert', 'success')}>Open Success alert</Button>
                  <Button onClick={() => openAlert('Info alert', 'info')}>Open Info alert</Button>
                  <Button onClick={() => openAlert('Error alert', 'error')}>Open Error alert</Button>
                  <Button onClick={() => openAlert('Persistent alert', 'default', true)}>Open Persistent alert</Button>
                </SectionContent>
              </SettingsSection>
            </>
          )}
        </SettingsCardContent>
      </SettingsCard>
    </SettingsView>
  );
};
