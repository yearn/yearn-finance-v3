import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import {
  ModalsActions,
  LinesActions,
  AlertsActions,
  AppSelectors,
  TokensSelectors,
  LinesSelectors,
  NetworkSelectors,
  WalletSelectors,
} from '@store';
import { useAppDispatch, useAppSelector, useAppTranslation, useIsMounting } from '@hooks';
import { LineDetailsDisplay, ViewContainer, SliderCard } from '@components/app';
import { SpinnerLoading, Text, Button } from '@components/common';
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

const WithdrawButton = styled(Button)`
  width: 18rem;
  margin-top: 1em;
  background-color: #00a3ff;
  margin-left: 1rem;
`;

const AddCreditButton = styled(Button)`
  width: 18rem;
  margin-top: 1em;
  background-color: #00a3ff;
  margin-left: 1rem;
`;

const BorrowButton = styled(Button)`
  width: 18rem;
  margin-top: 1em;
  background-color: #00a3ff;
  margin-left: 1rem;
`;

const DepositAndRepayButton = styled(Button)`
  width: 18rem;
  margin-top: 1em;
  background-color: #00a3ff;
  margin-left: 1rem;
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
  const linesStatus = useAppSelector(LinesSelectors.selectLinesStatus);
  // const linesPageData = useAppSelector(LinesSelectors.selectLinePageData);
  const tokensStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  //const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  //const walletName = useAppSelector(WalletSelectors.selectWallet);
  const userWalletAddress = useAppSelector(WalletSelectors.selectSelectedAddress);
  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];

  // Used to generate Transaction Button depending on whether user is lender, borrower, or arbiter.
  const [transactions, setTransactions] = useState<string[]>([]);

  // 1. get line address from url parms
  // 2. set selected line as current line
  // 3. fetch line page
  // 4.

  console.log(location);

  const depositHandler = () => {
    if (!selectedLine) {
      return;
    }
    let address = selectedLine.id;
    dispatch(LinesActions.setSelectedLineAddress({ lineAddress: address }));
    dispatch(ModalsActions.openModal({ modalName: 'addPosition' }));
  };

  // THIS NEEDS REVISITNG
  const liquidateHandler = () => {
    if (!selectedLine) {
      return;
    }
    let address = selectedLine.id;
    dispatch(LinesActions.setSelectedLineAddress({ lineAddress: address }));
    dispatch(ModalsActions.openModal({ modalName: 'liquidateBorrower' }));
  };

  const WithdrawHandler = () => {
    if (!selectedLine) {
      return;
    }
    let address = selectedLine.id;
    dispatch(LinesActions.setSelectedLineAddress({ lineAddress: address }));
    dispatch(ModalsActions.openModal({ modalName: 'withdraw' }));
  };

  useEffect(() => {
    let Transactions = [];
    console.log('user wallet: ', userWalletAddress, 'borrower', selectedLine?.borrower);
    if (userWalletAddress?.toLocaleLowerCase() === selectedLine?.borrower) {
      Transactions.push('borrow');
      Transactions.push('deposit-and-repay');
    }
    if (userWalletAddress?.toLocaleLowerCase() !== selectedLine?.borrower) {
      Transactions.push('deposit');
      Transactions.push('withdraw');
    }
    //@ts-ignore
    if (userWalletAddress?.toLocaleLowerCase() === selectedLine?.arbiter) {
      Transactions.push('liquidate');
    }
    setTransactions(Transactions);
  }, [userWalletAddress, selectedLine]);

  const borrowHandler = () => {
    if (!selectedLine) {
      return;
    }
    console.log(selectedLine);
    let address = selectedLine.id;
    dispatch(LinesActions.setSelectedLineAddress({ lineAddress: address }));
    dispatch(ModalsActions.openModal({ modalName: 'borrow' }));
  };

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

  const [firstTokensFetch, setFirstTokensFetch] = useState(false);
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

  // TODO: 0xframe also supports this
  //const displayAddToken = walletIsConnected && walletName.name === 'MetaMask';
  const depositAndRepayHandler = () => {
    dispatch(ModalsActions.openModal({ modalName: 'depositAndRepay' }));
  };

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
      {transactions.map((transaction, i) => {
        if (transaction === 'borrow') {
          return (
            <BorrowButton onClick={borrowHandler} key={`${transaction}-${i}`}>
              Borrow
            </BorrowButton>
          );
        }
        if (transaction === 'deposit') {
          return (
            <AddCreditButton onClick={depositHandler} key={`${transaction}-${i}`}>
              Deposit
            </AddCreditButton>
          );
        }
        if (transaction === 'deposit-and-repay') {
          return (
            <DepositAndRepayButton onClick={depositAndRepayHandler} key={`${transaction}-${i}`}>
              Repay
            </DepositAndRepayButton>
          );
        }
        if (transaction === 'liquidate') {
          return (
            <WithdrawButton onClick={liquidateHandler} key={`${transaction}-${i}`}>
              Liquidate
            </WithdrawButton>
          );
        }
        if (transaction === 'withdraw') {
          return (
            <WithdrawButton onClick={WithdrawHandler} key={`${transaction}-${i}`}>
              Withdraw
            </WithdrawButton>
          );
        } else {
          return;
        }
      })}
    </LineDetailView>
  );
};
