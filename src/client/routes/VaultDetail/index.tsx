import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import {
  VaultsActions,
  AlertsActions,
  AppSelectors,
  TokensSelectors,
  VaultsSelectors,
  NetworkSelectors,
  WalletSelectors,
} from '@store';
import { useAppDispatch, useAppSelector, useAppTranslation, useIsMounting } from '@hooks';
import { VaultDetailPanels, ViewContainer, InfoCard } from '@components/app';
import { SpinnerLoading, Button, Text } from '@components/common';
import { parseLastEarnings, isValidAddress, parseHistoricalEarnings } from '@utils';
import { getConfig } from '@config';
import { device } from '@themes/default';

const BackButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurfaceH2};
`;

const StyledInfoCard = styled(InfoCard)`
  padding: 3rem;
  margin: auto;
`;

const ViewHeader = styled.div``;

const VaultDetailView = styled(ViewContainer)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @media ${device.mobile} {
    ${StyledInfoCard} {
      padding: 1rem;
    }
  }
`;

export interface VaultDetailRouteParams {
  vaultAddress: string;
}

export const VaultDetail = () => {
  const { t } = useAppTranslation(['common', 'vaultdetails']);
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useLocation();
  const isMounting = useIsMounting();
  const { NETWORK_SETTINGS } = getConfig();

  const appStatus = useAppSelector(AppSelectors.selectAppStatus);
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const vaultsStatus = useAppSelector(VaultsSelectors.selectVaultsStatus);
  const tokensStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const walletName = useAppSelector(WalletSelectors.selectWallet);

  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
  const blockExplorerUrl = currentNetworkSettings.blockExplorerUrl;

  const [firstTokensFetch, setFirstTokensFetch] = useState(false);
  const [tokensInitialized, setTokensInitialized] = useState(false);

  useEffect(() => {
    const assetAddress: string | undefined = location.pathname.split('/')[2];
    if (!assetAddress || !isValidAddress(assetAddress)) {
      dispatch(AlertsActions.openAlert({ message: 'INVALID_ADDRESS', type: 'error' }));
      history.push('/home');
      return;
    }
    dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress: assetAddress }));

    return () => {
      dispatch(VaultsActions.clearSelectedVaultAndStatus());
    };
  }, []);

  useEffect(() => {
    const loading = tokensStatus.loading;
    if (loading && !firstTokensFetch) setFirstTokensFetch(true);
    if (!loading && firstTokensFetch) setTokensInitialized(true);
  }, [tokensStatus.loading]);

  const [firstVaultsFetch, setFirstVaultsFetch] = useState(false);
  const [vaultsInitialized, setVaultsInitialized] = useState(false);

  useEffect(() => {
    const loading = vaultsStatus.loading;
    if (loading && !firstVaultsFetch) setFirstVaultsFetch(true);
    if (!loading && firstVaultsFetch) setVaultsInitialized(true);
  }, [vaultsStatus.loading]);

  const generalLoading =
    (appStatus.loading || vaultsStatus.loading || tokensStatus.loading || isMounting) &&
    (!tokensInitialized || !vaultsInitialized);

  const chartData = currentNetworkSettings.earningsEnabled
    ? parseHistoricalEarnings(selectedVault?.historicalEarnings, selectedVault?.token.decimals)
    : undefined;
  const chartValue = currentNetworkSettings.earningsEnabled
    ? parseLastEarnings(selectedVault?.historicalEarnings, selectedVault?.token.decimals)
    : undefined;

  const displayAddToken = walletIsConnected && walletName.name === 'MetaMask';

  return (
    <VaultDetailView>
      <ViewHeader>
        <BackButton onClick={() => history.push(`/vaults`)}>{t('components.back-button.label')}</BackButton>
      </ViewHeader>

      {generalLoading && <SpinnerLoading flex="1" width="100%" height="100%" />}

      {!generalLoading && !selectedVault && (
        <StyledInfoCard
          header={t('vaultdetails:no-vault-supported-card.header', { network: currentNetworkSettings.name })}
          Component={
            <Text>
              <p>{t('vaultdetails:no-vault-supported-card.content')}</p>
            </Text>
          }
        />
      )}

      {!generalLoading && selectedVault && (
        <VaultDetailPanels
          selectedVault={selectedVault}
          chartData={chartData}
          chartValue={chartValue}
          displayAddToken={displayAddToken}
          currentNetwork={currentNetwork}
          blockExplorerUrl={blockExplorerUrl}
        />
      )}
    </VaultDetailView>
  );
};
