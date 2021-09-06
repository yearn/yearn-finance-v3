import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { useAppTranslation, useAppSelector, useAppDispatch, useWindowDimensions } from '@hooks';
import { ThemeActions, SettingsActions, SettingsSelectors, AlertsActions, ModalsActions } from '@store';
import { getTheme } from '@themes';
import { getConfig } from '@config';
import { AlertTypes, ModalName, Theme } from '@types';

import { ViewContainer } from '@components/app';
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
import { device } from '@themes/default';
import { formatPercent } from '@utils';

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
  padding: 0 ${({ theme }) => theme.cardPadding};
  gap: 1.5rem;
`;

const SectionContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  align-items: center;

  ${SettingsSection}:not(:first-child) & {
    padding-top: ${sectionsGap};
  }
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
        padding-top: ${({ theme }) => theme.cardPadding};
      }
      :not(:first-child) ${SectionContent} {
        padding-top: 0;
      }

      :first-child ${SectionTitle}, :last-child ${SectionTitle} {
        border-radius: 0;
      }
    }
    ${SectionContent} {
      padding: 0 ${({ theme }) => theme.cardPadding};
    }
  }
`;

export const Settings = () => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { isMobile } = useWindowDimensions();

  const currentTheme = useAppSelector(({ theme }) => theme.current);
  const devModeSettings = useAppSelector(SettingsSelectors.selectDevModeSettings);
  const defaultSlippage = useAppSelector(SettingsSelectors.selectDefaultSlippage);
  const collapsedSidebar = useAppSelector(SettingsSelectors.selectSidebarCollapsed);

  const availableSlippages = getConfig().SLIPPAGE_OPTIONS;
  const { ALLOW_DEV_MODE, AVAILABLE_THEMES } = getConfig();
  const changeTheme = (theme: Theme) => dispatch(ThemeActions.changeTheme({ theme }));

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

  return (
    <SettingsView>
      <SettingsCard>
        <SettingsCardHeader header={t('settings.preferences')} />

        <SettingsCardContent>
          <SettingsSection>
            <SectionTitle>
              <SectionIcon Component={ClockIcon} />
              Slippage Tolerance
            </SectionTitle>
            <SectionContent>
              {availableSlippages.map((slippage) => (
                <SlippageOption onClick={() => changeSlippage(slippage)} active={slippage === defaultSlippage}>
                  {formatPercent(slippage.toString(), 0)}
                </SlippageOption>
              ))}
            </SectionContent>
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
