import styled from 'styled-components';

import { useAppTranslation, useAppSelector, useAppDispatch } from '@hooks';
import { ThemeActions, SettingsActions, SettingsSelectors, AlertsActions, TokensActions } from '@store';
import { getTheme } from '@themes';
import { getConfig } from '@config';
import { AlertTypes, ModalName, Theme } from '@types';

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
import { formatPercent } from '@utils';

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

export const Settings = () => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(({ theme }) => theme.current);
  const devModeSettings = useAppSelector(SettingsSelectors.selectDevModeSettings);
  const defaultSlippage = useAppSelector(SettingsSelectors.selectDefaultSlippage);
  const availableSlippages = getConfig().SLIPPAGE_OPTIONS;
  const { ALLOW_DEV_MODE, AVAILABLE_THEMES } = getConfig();
  const changeTheme = (theme: Theme) => dispatch(ThemeActions.changeTheme({ theme }));

  const changeSlippage = (slippage: number) => {
    dispatch(SettingsActions.setDefaultSlippage({ slippage }));
  };

  const openModal = (modalName: ModalName, modalProps?: any) => {
    dispatch(ModalsActions.openModal({ modalName, modalProps }));
  };

  const openDepositModal = () => {
    // NOTE Hardcoded token address for depositTx testing
    const tokenAddress = '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e';
    // dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress }));
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress }));
    dispatch(ModalsActions.openModal({ modalName: 'depositTx' }));
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

          {/* Only on development for testing! */}
          {ALLOW_DEV_MODE && (
            <SettingsSection>
              <SectionTitle>
                <SectionIcon Component={ThemesIcon} />
                Modals testing
              </SectionTitle>
              <SectionContent>
                <Button onClick={() => openModal('test', { testVar: 'test variable' })}>Open test modal</Button>
                <Button onClick={() => openModal('testTx')}>Open TestTx modal</Button>
                <Button onClick={() => openDepositModal()}>Open DepositTx modal</Button>
              </SectionContent>
            </SettingsSection>
          )}

          {/* Only on development for testing! */}
          {ALLOW_DEV_MODE && (
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
