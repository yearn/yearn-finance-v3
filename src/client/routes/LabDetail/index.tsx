import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import {
  AlertsActions,
  AppSelectors,
  TokensSelectors,
  NetworkSelectors,
  WalletSelectors,
  LabsSelectors,
  LabsActions,
} from '@store';
import { useAppDispatch, useAppSelector, useAppTranslation, useIsMounting } from '@hooks';
import { ViewContainer, InfoCard } from '@components/app';
import { SpinnerLoading, Button, Text } from '@components/common';
import { isValidAddress } from '@utils';
import { getConfig } from '@config';
import { device } from '@themes/default';
import { LabDetailPanels } from '@src/client/components/app/LabDetail';

const BackButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurfaceH2};
`;

const StyledInfoCard = styled(InfoCard)`
  padding: 3rem;
  margin: auto;
`;

const LabDetailView = styled(ViewContainer)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @media ${device.mobile} {
    ${StyledInfoCard} {
      padding: 1rem;
    }
  }
`;

export interface LabDetailRouteParams {
  labAddress: string;
}

export const LabDetail = () => {
  const { t } = useAppTranslation(['common', 'labdetails']);
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useLocation();
  const isMounting = useIsMounting();
  const { NETWORK_SETTINGS } = getConfig();

  const appStatus = useAppSelector(AppSelectors.selectAppStatus);
  const selectedLab = useAppSelector(LabsSelectors.selectSelectedLab);
  const labsStatus = useAppSelector(LabsSelectors.selectLabsStatus);
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
    dispatch(LabsActions.setSelectedLabAddress({ labAddress: assetAddress }));

    return () => {
      dispatch(LabsActions.clearSelectedLabAndStatus());
    };
  }, [currentNetwork]);

  useEffect(() => {
    const loading = tokensStatus.loading;
    if (loading && !firstTokensFetch) setFirstTokensFetch(true);
    if (!loading && firstTokensFetch) setTokensInitialized(true);
  }, [tokensStatus.loading]);

  const generalLoading =
    (appStatus.loading || labsStatus.loading || tokensStatus.loading || isMounting) && !tokensInitialized;

  const displayAddToken = walletIsConnected && walletName.name === 'MetaMask';

  return (
    <LabDetailView>
      <BackButton onClick={() => history.push(`/labs`)}>{t('components.back-button.label')}</BackButton>

      {generalLoading && <SpinnerLoading flex="1" width="100%" height="100%" />}

      {!generalLoading && !selectedLab && (
        <StyledInfoCard
          header={t('labdetails:no-lab-supported-card.header', { network: currentNetworkSettings.name })}
          Component={
            <Text>
              <p>{t('labdetails:no-lab-supported-card.content')}</p>
            </Text>
          }
        />
      )}

      {!generalLoading && selectedLab && (
        <LabDetailPanels
          selectedLab={selectedLab}
          displayAddToken={displayAddToken}
          currentNetwork={currentNetwork}
          blockExplorerUrl={blockExplorerUrl}
        />
      )}
    </LabDetailView>
  );
};
