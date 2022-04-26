import { useEffect, useState } from 'react';
import i18n from 'i18next';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

import { useAppTranslation, useAppSelector, useAppDispatch, useWindowDimensions } from '@hooks';
import { ThemeActions, SettingsActions, SettingsSelectors, AlertsActions, ModalsActions } from '@store';
import { getTheme } from '@themes';
import { device } from '@themes/default';
import { getConfig } from '@config';
import { AlertTypes, ModalName, Theme, Language } from '@types';
import { formatPercent, getCurrentLanguage } from '@utils';
import { ViewContainer, ThemeBox, CustomThemeButton } from '@components/app';
import { Button, ToggleButton, Input, Card, CardContent, OptionList } from '@components/common';

const SettingsCardContent = styled(CardContent)`
  flex-direction: column;
  align-items: flex-start;
`;

const SettingsCard = styled(Card)`
  display: grid;
  padding: ${({ theme }) => theme.card.padding} 0;
  width: 100%;
`;

const SettingsSection = styled.div`
  display: grid;
  grid-template-columns: 15rem 1fr;
  padding: 0 ${({ theme }) => theme.card.padding};
  grid-gap: ${({ theme }) => theme.layoutPadding};
`;

const SectionContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  grid-gap: ${({ theme }) => theme.layoutPadding};
  align-items: center;

  ${SettingsSection}:not(:first-child) & {
    padding-top: ${({ theme }) => theme.card.padding};
  }
`;

const SectionTitle = styled.div<{ centerText?: boolean }>`
  display: flex;
  align-items: ${({ centerText }) => (centerText ? 'center' : 'flex-start')};
  fill: currentColor;
`;

const SectionHeading = styled.h3`
  color: ${({ theme }) => theme.colors.titles};
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
  width: 8rem;
  height: 8rem;
  border: 2px solid transparent;
  color: ${({ theme }) => theme.colors.titles};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.globalRadius};
  font-weight: 700;
  cursor: pointer;

  ${({ active, theme }) =>
    active &&
    `
    background-color: ${theme.colors.backgroundVariant};
    color: ${theme.colors.titlesVariant};
    border-color: ${theme.colors.primary};
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
      padding: 0;
    }
  }
`;

export const Settings = () => {
  const { t } = useAppTranslation(['common', 'settings']);
  const { isTablet } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
    navigate(`/vault/${address}`);
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
        <SettingsCardContent>
          <SettingsSection>
            <SectionTitle>
              <SectionHeading>{t('settings:signed-approvals')}</SectionHeading>
            </SectionTitle>

            <SectionContent>
              <ToggleButton selected={signedApprovalsEnabled} setSelected={toggleSignedApprovals} />
            </SectionContent>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>
              <SectionHeading>{t('settings:slippage-tolerance')}</SectionHeading>
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
              <SectionHeading>{t('settings:themes')}</SectionHeading>
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
            <SectionTitle centerText>
              <SectionHeading>{t('settings:language')}</SectionHeading>
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
              <SectionTitle>Dev Mode</SectionTitle>
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
                <SectionTitle>Additional settings</SectionTitle>
                <SectionContent>
                  Expanded sidenav
                  <ToggleButton selected={!collapsedSidebar} setSelected={toggleSidebar} />
                </SectionContent>
              </SettingsSection>

              <SettingsSection>
                <SectionTitle>Modals testing</SectionTitle>
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
                <SectionTitle>Alerts testing</SectionTitle>
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
