import { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch, useIsMounting } from '@hooks';
import {
  ModalsActions,
  IronBankActions,
  IronBankSelectors,
  WalletSelectors,
  TokensSelectors,
  ModalSelectors,
  AppSelectors,
} from '@store';

import { SpinnerLoading, ToggleButton, SearchInput, Text } from '@components/common';
import {
  SummaryCard,
  DetailCard,
  ViewContainer,
  ActionButtons,
  TokenIcon,
  NoWalletCard,
  RecommendationsCard,
  InfoCard,
  Amount,
} from '@components/app';
import { normalizeUsdc, normalizePercent, humanizeAmount, halfWidthCss, normalizeAmount } from '@src/utils';
import { device } from '@themes/default';

const SearchBarContainer = styled.div`
  margin: 1.2rem;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  grid-gap: ${({ theme }) => theme.layoutPadding};
  flex-wrap: wrap;
  width: 100%;
`;

const StyledRecommendationsCard = styled(RecommendationsCard)`
  ${halfWidthCss}
`;

const StyledInfoCard = styled(InfoCard)`
  max-width: 100%;
  flex: 1;
  ${halfWidthCss}
`;

const StyledNoWalletCard = styled(NoWalletCard)`
  width: 100%;
  ${halfWidthCss}
`;

const SupplyingCard = styled(DetailCard)`
  @media (max-width: 860px) {
    .col-name {
      width: 7rem;
    }
  }
  @media (max-width: 760px) {
    .col-balance {
      display: none;
    }
  }
  @media (max-width: 630px) {
    .col-apy {
      display: none;
    }
  }
  @media (max-width: 600px) {
    .col-apy {
      display: flex;
    }
  }
  @media (max-width: 450px) {
    .col-apy {
      display: none;
    }
  }
  @media (max-width: 360px) {
    .col-value {
      display: none;
    }
  }
` as typeof DetailCard;

const BorrowingCard = styled(DetailCard)`
  @media (max-width: 800px) {
    .col-name {
      width: 7rem;
    }
  }
  @media (max-width: 700px) {
    .col-balance {
      display: none;
    }
  }
  @media (max-width: 360px) {
    .col-apy {
      display: none;
    }
  }
` as typeof DetailCard;

const OpportunitiesCard = styled(DetailCard)`
  @media ${device.tablet} {
    .col-market {
      display: none;
    }
  }
  @media (max-width: 700px) {
    .col-name {
      width: 7rem;
    }
  }
  @media ${device.mobile} {
    .col-lend-apy,
    .col-borrow-apy {
      display: none;
    }

    .col-available {
      width: 10rem;
    }
  }
` as typeof DetailCard;

export const IronBank = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const isMounting = useIsMounting();
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const { supplyBalanceUsdc, borrowBalanceUsdc, borrowUtilizationRatio, netAPY, borrowLimitUsdc } = useAppSelector(
    IronBankSelectors.selectSummaryData
  );
  const recommendations = useAppSelector(IronBankSelectors.selectRecommendations);
  const markets = useAppSelector(IronBankSelectors.selectMarkets);
  const supplied = useAppSelector(IronBankSelectors.selectLendMarkets);
  const borrowed = useAppSelector(IronBankSelectors.selectBorrowMarkets);
  const [filteredMarkets, setFilteredMarkets] = useState(markets);
  const activeModal = useAppSelector(ModalSelectors.selectActiveModal);

  const appStatus = useAppSelector(AppSelectors.selectAppStatus);
  const ironBankStatus = useAppSelector(IronBankSelectors.selectIronBankStatus);
  const tokensStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);
  const generalLoading =
    (appStatus.loading || ironBankStatus.loading || tokensStatus.loading || isMounting) && !activeModal;

  useEffect(() => {
    setFilteredMarkets(markets);
  }, [markets]);

  const actionHandler = (action: string, marketAddress: string) => {
    switch (action) {
      case 'enterMarket':
        dispatch(IronBankActions.enterOrExitMarket({ marketAddress: marketAddress, actionType: 'enterMarket' }));
        break;
      case 'exitMarket':
        dispatch(IronBankActions.enterOrExitMarket({ marketAddress: marketAddress, actionType: 'exitMarket' }));
        break;
      case 'supply':
        dispatch(IronBankActions.setSelectedMarketAddress({ marketAddress }));
        dispatch(ModalsActions.openModal({ modalName: 'IronBankSupplyTx' }));
        break;
      case 'withdraw':
        dispatch(IronBankActions.setSelectedMarketAddress({ marketAddress }));
        dispatch(ModalsActions.openModal({ modalName: 'IronBankWithdrawTx' }));
        break;
      case 'borrow':
        dispatch(IronBankActions.setSelectedMarketAddress({ marketAddress }));
        dispatch(ModalsActions.openModal({ modalName: 'IronBankBorrowTx' }));
        break;
      case 'repay':
        dispatch(IronBankActions.setSelectedMarketAddress({ marketAddress }));
        dispatch(ModalsActions.openModal({ modalName: 'IronBankRepayTx' }));
        break;
    }
  };

  return (
    <ViewContainer>
      <SummaryCard
        header="Dashboard"
        items={[
          { header: 'Supplied', Component: <Amount value={supplyBalanceUsdc} input="usdc" /> },
          { header: 'Borrowed', Component: <Amount value={borrowBalanceUsdc} input="usdc" /> },
          {
            header: 'Borrow Limit Used',
            Component: <Amount value={borrowUtilizationRatio} input="weipercent" />,
          },
          { header: 'Total Borrow Limit', Component: <Amount value={borrowLimitUsdc} input="usdc" /> },
        ]}
        variant="secondary"
        cardSize="small"
      />

      {generalLoading && <SpinnerLoading flex="1" width="100%" />}

      {!generalLoading && (
        <>
          <Row>
            <StyledRecommendationsCard
              header="Recommendations"
              items={recommendations.map(({ token, lendApy, address }) => ({
                icon: token.icon ?? '',
                name: token.symbol,
                info: normalizePercent(lendApy, 2),
                infoDetail: 'EYY',
                onAction: () => actionHandler('supply', address),
              }))}
            />

            <StyledInfoCard
              header="Dreaming of more tokens?"
              Component={
                <Text>
                  Iron Bank offers a simple way to get exposure to new tokens. Borrow using your crypto as collateral
                  and recognize liquidity without having to sell your holdings. Didn’t find the right Vault for your
                  tokens? Supply them to Iron Bank and earn interest.
                  <br />
                  <br />
                  Check out the opportunities and corresponding APY below and click ‘Supply’ to get started!
                </Text>
              }
            />
          </Row>

          {!walletIsConnected && <StyledNoWalletCard />}

          <SupplyingCard
            header="Supplying"
            metadata={[
              {
                key: 'displayIcon',
                transform: ({ displayIcon, token }) => <TokenIcon icon={displayIcon} symbol={token.symbol} />,
                width: '6rem',
                className: 'col-icon',
              },
              {
                key: 'displayName',
                header: 'Name',
                sortable: true,
                fontWeight: 600,
                width: '17rem',
                className: 'col-name',
              },
              {
                key: 'lendApy',
                header: 'APY',
                format: ({ lendApy }) => normalizePercent(lendApy, 2),
                sortable: true,
                width: '8rem',
                className: 'col-apy',
              },
              {
                key: 'balance',
                header: 'Balance',
                format: ({ userDeposited, token }) => humanizeAmount(userDeposited, token.decimals, 4),
                sortable: true,
                width: '13rem',
                className: 'col-balance',
              },
              {
                key: 'userDepositedUsdc',
                header: 'Value',
                format: ({ userDepositedUsdc }) => normalizeUsdc(userDepositedUsdc),
                sortable: true,
                width: '11rem',
                className: 'col-value',
              },
              {
                key: 'collateral',
                header: 'Collateral',
                transform: ({ collateral, address }) => (
                  <ToggleButton
                    selected={collateral}
                    setSelected={() =>
                      collateral ? actionHandler('exitMarket', address) : actionHandler('enterMarket', address)
                    }
                  />
                ),
                width: '8rem',
                className: 'col-collateral',
              },
              {
                key: 'actions',
                transform: ({ address }) => (
                  <ActionButtons
                    actions={[
                      { name: 'Supply', handler: () => actionHandler('supply', address) },
                      { name: 'Withdraw', handler: () => actionHandler('withdraw', address) },
                    ]}
                  />
                ),
                align: 'flex-end',
                width: 'auto',
                grow: '1',
              },
            ]}
            data={supplied.map((market) => ({
              ...market,
              displayIcon: market.token.icon ?? '',
              displayName: market.token.symbol,
              balance: normalizeAmount(market.userDeposited, market.token.decimals),
              collateral: market.enteredMarket,
              actions: null,
            }))}
            initialSortBy="userDepositedUsdc"
            wrap
          />

          <BorrowingCard
            header="Borrowing"
            metadata={[
              {
                key: 'displayIcon',
                transform: ({ displayIcon, token }) => <TokenIcon icon={displayIcon} symbol={token.symbol} />,
                width: '6rem',
                className: 'col-icon',
              },
              {
                key: 'displayName',
                header: 'Name',
                sortable: true,
                fontWeight: 600,
                width: '17rem',
                className: 'col-name',
              },
              {
                key: 'borrowApy',
                header: 'APY',
                format: ({ borrowApy }) => normalizePercent(borrowApy, 2),
                sortable: true,
                width: '8rem',
                className: 'col-apy',
              },
              {
                key: 'balance',
                header: 'Balance',
                format: ({ userDeposited, token }) => humanizeAmount(userDeposited, token.decimals, 4),
                sortable: true,
                width: '13rem',
                className: 'col-balance',
              },
              {
                key: 'userDepositedUsdc',
                header: 'Value',
                format: ({ userDepositedUsdc }) => normalizeUsdc(userDepositedUsdc),
                sortable: true,
                width: '11rem',
                className: 'col-value',
              },
              {
                key: 'actions',
                transform: ({ address }) => (
                  <ActionButtons
                    actions={[
                      { name: 'Borrow', handler: () => actionHandler('borrow', address) },
                      { name: 'Repay', handler: () => actionHandler('repay', address) },
                    ]}
                  />
                ),
                align: 'flex-end',
                width: 'auto',
                grow: '1',
              },
            ]}
            data={borrowed.map((market) => ({
              ...market,
              displayIcon: market.token.icon ?? '',
              displayName: market.token.symbol,
              balance: normalizeAmount(market.userDeposited, market.token.decimals),
              actions: null,
            }))}
            initialSortBy="userDepositedUsdc"
            wrap
          />

          <OpportunitiesCard
            header="Opportunities"
            metadata={[
              {
                key: 'displayIcon',
                transform: ({ displayIcon, token }) => <TokenIcon icon={displayIcon} symbol={token.symbol} />,
                width: '6rem',
                className: 'col-icon',
              },
              {
                key: 'displayName',
                header: 'Name',
                sortable: true,
                fontWeight: 600,
                width: '17rem',
                className: 'col-name',
              },
              {
                key: 'lendApy',
                header: 'Lend APY',
                format: ({ lendApy }) => normalizePercent(lendApy, 2),
                sortable: true,
                width: '8rem',
                className: 'col-lend-apy',
              },
              {
                key: 'borrowApy',
                header: 'Borrow APY',
                format: ({ borrowApy }) => normalizePercent(borrowApy, 2),
                sortable: true,
                width: '8rem',
                className: 'col-borrow-apy',
              },
              {
                key: 'liquidity',
                header: 'Market Liquidity',
                format: ({ liquidity }) => normalizeUsdc(liquidity, 0),
                sortable: true,
                width: '15rem',
                className: 'col-market',
              },
              {
                key: 'userTokenBalance',
                header: 'Available to Invest',
                format: ({ token }) => (token.balance === '0' ? '-' : humanizeAmount(token.balance, token.decimals, 4)),
                sortable: true,
                width: '15rem',
                className: 'col-available',
              },
              {
                key: 'actions',
                transform: ({ address }) => (
                  <ActionButtons
                    actions={[
                      { name: 'Supply', handler: () => actionHandler('supply', address), disabled: !walletIsConnected },
                      { name: 'Borrow', handler: () => actionHandler('borrow', address), disabled: !walletIsConnected },
                    ]}
                  />
                ),
                align: 'flex-end',
                width: 'auto',
                grow: '1',
              },
            ]}
            data={filteredMarkets.map((market) => ({
              ...market,
              displayIcon: market.token.icon ?? '',
              displayName: market.token.symbol,
              userTokenBalance: normalizeAmount(market.token.balance, market.token.decimals),
              actions: null,
            }))}
            SearchBar={
              <SearchBarContainer>
                <SearchInput
                  searchableData={markets}
                  searchableKeys={['name', 'token.symbol', 'token.name']}
                  placeholder=""
                  onSearch={(data) => setFilteredMarkets(data)}
                />
              </SearchBarContainer>
            }
            searching={markets.length > filteredMarkets.length}
            initialSortBy="lendApy"
            wrap
          />
        </>
      )}
    </ViewContainer>
  );
};
