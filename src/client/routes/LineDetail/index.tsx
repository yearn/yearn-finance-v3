import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import {
  LinesActions,
  AlertsActions,
  AppSelectors,
  TokensSelectors,
  LinesSelectors,
  NetworkSelectors,
  WalletSelectors,
} from '@store';
import { useAppDispatch, useAppSelector, useAppTranslation, useIsMounting } from '@hooks';
import { VaultDetailPanels, ViewContainer, SliderCard } from '@components/app';
import { SpinnerLoading, Text } from '@components/common';
import {
  // parseHistoricalEarningsUnderlying,
  // parseHistoricalEarningsUsd,
  isValidAddress,
  // parseLastEarningsUsd,
  // parseLastEarningsUnderlying,
} from '@utils';
import { getConfig } from '@config';
import { device } from '@themes/default';

const StyledSliderCard = styled(SliderCard)`
  padding: 3rem;
  margin: auto;
`;

const LineDetailView = styled(ViewContainer)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @media ${device.mobile} {
    ${StyledSliderCard} {
      padding: 1rem;
    }
  }
`;

export interface LineDetailRouteParams {
  lineAddress: string;
}

export const LineDetail = () => {
  const { t } = useAppTranslation(['common', 'linedetails']);
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useLocation();
  const isMounting = useIsMounting();
  const { NETWORK_SETTINGS } = getConfig();

  const appStatus = useAppSelector(AppSelectors.selectAppStatus);
  const selectedLine = useAppSelector(LinesSelectors.selectSelectedLine);
  const linesStatus = useAppSelector(LinesSelectors.selectLinesStatus);
  // const linesPageData = useAppSelector(LinesSelectors.selectLinePageData);
  const tokensStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const selectedLinePage = useAppSelector(LinesSelectors.selectSelectedLinePage);
  const walletName = useAppSelector(WalletSelectors.selectWallet);

  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
  const blockExplorerUrl = currentNetworkSettings.blockExplorerUrl;

  // 1. get line address from url parms
  // 2. set selected line as current line
  // 3. fetch line page
  // 4.

  useEffect(() => {
    const lineAddress: string | undefined = location.pathname.split('/')[2];
    if (!lineAddress || !isValidAddress(lineAddress)) {
      dispatch(AlertsActions.openAlert({ message: 'INVALID_ADDRESS', type: 'error' }));
      history.push('/market');
      return;
    }
    dispatch(LinesActions.setSelectedLineAddress({ lineAddress: lineAddress }));
    dispatch(LinesActions.getLinePage({ id: lineAddress }));

    return () => {
      dispatch(LinesActions.clearSelectedLineAndStatus());
    };
  }, []);

  const [firstTokensFetch, setFirstTokensFetch] = useState(false);
  const [tokensInitialized, setTokensInitialized] = useState(false);

  useEffect(() => {
    const assetAddress: string | undefined = location.pathname.split('/')[2];
    if (!assetAddress || !isValidAddress(assetAddress)) {
      dispatch(AlertsActions.openAlert({ message: 'INVALID_ADDRESS', type: 'error' }));
      history.push('/portfolio');
      return;
    }
    dispatch(LinesActions.setSelectedLineAddress({ lineAddress: assetAddress }));

    return () => {
      dispatch(LinesActions.clearSelectedLineAndStatus());
    };
  }, [currentNetwork]);

  useEffect(() => {
    const loading = tokensStatus.loading;
    if (loading && !firstTokensFetch) setFirstTokensFetch(true);
    if (!loading && firstTokensFetch) setTokensInitialized(true);
  }, [tokensStatus.loading]);

  const [firstLinesFetch, setFirstLinesFetch] = useState(false);
  const [linesInitialized, setLinesInitialized] = useState(false);

  useEffect(() => {
    const loading = linesStatus.loading;
    if (loading && !firstLinesFetch) setFirstLinesFetch(true);
    if (!loading && firstLinesFetch) setLinesInitialized(true);
  }, [linesStatus.loading]);

  const generalLoading =
    (appStatus.loading || linesStatus.loading || tokensStatus.loading || isMounting) &&
    (!tokensInitialized || !linesInitialized);

  const chartData = currentNetworkSettings.earningsEnabled
    ? {
        // underlying: parseHistoricalEarningsUnderlying(selectedLine?.historicalEarnings, selectedLine?.token.decimals),
        // usd: parseHistoricalEarningsUsd(selectedLine?.historicalEarnings),
      }
    : {};
  const chartValue = currentNetworkSettings.earningsEnabled
    ? {
        // usd: parseLastEarningsUsd(selectedLine?.historicalEarnings),
        // underlying: parseLastEarningsUnderlying(selectedLine?.historicalEarnings, selectedLine?.token.decimals),
      }
    : {};

  // TODO: 0xframe also supports this
  const displayAddToken = walletIsConnected && walletName.name === 'MetaMask';

  return (
    <LineDetailView>
      {generalLoading && <SpinnerLoading flex="1" width="100%" height="100%" />}

      {!generalLoading && !selectedLine && (
        <StyledSliderCard
          header={t('linedetails:no-line-supported-card.header', { network: currentNetworkSettings.name })}
          Component={
            <Text>
              <p>{t('linedetails:no-line-supported-card.content')}</p>
            </Text>
          }
        />
      )}

      {/* {!generalLoading && selectedLine && (
        <VaultDetailPanels
          selectedVault={selectedLine}
          chartData={chartData}
          chartValue={chartValue}
          displayAddToken={displayAddToken}
          currentNetwork={currentNetwork}
          blockExplorerUrl={blockExplorerUrl}
        />
      )} */}
    </LineDetailView>
  );
};
