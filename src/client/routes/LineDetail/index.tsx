import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { LinesActions, AlertsActions, AppSelectors, TokensSelectors, LinesSelectors, NetworkSelectors } from '@store';
import { useAppDispatch, useAppSelector, useAppTranslation, useIsMounting } from '@hooks';
import { LineDetailsDisplay, ViewContainer, SliderCard } from '@components/app';
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
  const { t } = useAppTranslation(['common', 'lineDetails']);
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useLocation();
  const isMounting = useIsMounting();
  const { NETWORK_SETTINGS } = getConfig();

  const appStatus = useAppSelector(AppSelectors.selectAppStatus);
  const selectedLine = useAppSelector(LinesSelectors.selectSelectedLine);
  const selectedPage = useAppSelector(LinesSelectors.selectSelectedLinePage);
  // const selectedLineCreditEvents = useAppSelector(LinesSelectors.selectSelectedLineCreditEvents);
  const getLinePageStatus = useAppSelector(LinesSelectors.selectGetLinePageStatus);
  // const linesPageData = useAppSelector(LinesSelectors.selectLinePageData);
  const tokensStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  //const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  //const walletName = useAppSelector(WalletSelectors.selectWallet);
  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];

  // 1. get line address from url parms
  // 2. set selected line as current line
  // 3. fetch line page
  // 4.

  console.log(location);

  useEffect(() => {
    const lineAddress: string | undefined = location.pathname.split('/')[2];

    console.log('line address', lineAddress);
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
  }, [selectedLine, selectedPage]);

  const [firstTokensFetch, setFirstTokensFetch] = useState(true);
  const [tokensInitialized, setTokensInitialized] = useState(false);

  useEffect(() => {
    const lineAddress: string | undefined = location.pathname.split('/')[2];
    if (!lineAddress || !isValidAddress(lineAddress)) {
      dispatch(AlertsActions.openAlert({ message: 'INVALID_ADDRESS', type: 'error' }));
      history.push('/market');
      return;
    }
    dispatch(LinesActions.setSelectedLineAddress({ lineAddress }));

    return () => {
      dispatch(LinesActions.clearSelectedLineAndStatus());
    };
  }, [currentNetwork]);

  useEffect(() => {
    const loading = tokensStatus.loading;
    if (loading && !firstTokensFetch) setFirstTokensFetch(true);
    if (!loading && firstTokensFetch) setTokensInitialized(true);
  }, [tokensStatus.loading]);

  const [firstLinesFetch, setFirstLinesFetch] = useState(true);
  const [linesInitialized, setLinesInitialized] = useState(false);

  useEffect(() => {
    const loading = getLinePageStatus.loading;
    if (loading && !firstLinesFetch) setFirstLinesFetch(true);
    if (!loading && firstLinesFetch) setLinesInitialized(true);
  }, [getLinePageStatus.loading]);

  const generalLoading =
    appStatus.loading ||
    getLinePageStatus.loading ||
    tokensStatus.loading ||
    (isMounting && (!tokensInitialized || !linesInitialized));

  // TODO: 0xframe also supports this
  //const displayAddToken = walletIsConnected && walletName.name === 'MetaMask';
  return (
    <LineDetailView>
      {generalLoading && <SpinnerLoading flex="1" width="100%" height="100%" />}

      {!generalLoading && !selectedLine && (
        <StyledSliderCard
          header={t('lineDetails:no-line-supported-card.header', { network: currentNetworkSettings.name })}
          Component={
            <Text>
              <p>{t('lineDetails:no-line-supported-card.content')} hi</p>
            </Text>
          }
        />
      )}

      {selectedLine && <LineDetailsDisplay page={selectedPage} line={selectedLine} />}
    </LineDetailView>
  );
};
