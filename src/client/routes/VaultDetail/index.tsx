import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { AppSelectors, TokensSelectors, VaultsSelectors, NetworkSelectors, WalletSelectors } from '@store';
import { useAppSelector, useAppTranslation, useIsMounting } from '@hooks';
import { VaultDetailPanels, ViewContainer, InfoCard } from '@components/app';
import { SpinnerLoading, Button, Text } from '@components/common';
import { parseHistoricalEarnings, parseLastEarnings } from '@utils';
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

  const history = useHistory();
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

  const [firstTokensFetch, setFirstTokensFetch] = useState(false);
  const [tokensInitialized, setTokensInitialized] = useState(false);

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

  // const chartData = [
  //   {
  //     id: 'japan',
  //     // color: '#d9269a',
  //     data: [
  //       { x: '2019-05-01', y: 2 },
  //       { x: '2019-06-01', y: 7 },
  //       { x: '2019-06-15', y: 17 },
  //       { x: '2019-06-23', y: 1 },
  //       { x: '2019-08-01', y: 42 },
  //       { x: '2019-09-01', y: 1 },
  //     ],
  //   },
  // ];

  const chartData = currentNetworkSettings.earningsEnabled
    ? parseHistoricalEarnings(selectedVault?.historicalEarnings)
    : undefined;
  const chartValue = currentNetworkSettings.earningsEnabled
    ? parseLastEarnings(selectedVault?.historicalEarnings)
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
        />
      )}
    </VaultDetailView>
  );
};
