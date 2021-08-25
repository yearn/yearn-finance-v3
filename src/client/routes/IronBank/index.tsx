import { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';
import {
  ModalsActions,
  IronBankActions,
  IronBankSelectors,
  WalletSelectors,
  TokensSelectors,
  ModalSelectors,
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
} from '@components/app';
import { normalizeUsdc, normalizePercent, humanizeAmount, halfWidthCss } from '@src/utils';
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
`;

export const IronBank = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
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

  const ironBankStatus = useAppSelector(IronBankSelectors.selectIronBankStatus);
  const tokensStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);
  const generalLoading = (ironBankStatus.loading || tokensStatus.loading) && !activeModal;

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
          { header: 'Supplied', content: `${normalizeUsdc(supplyBalanceUsdc)}` },
          { header: 'Borrowed', content: `${normalizeUsdc(borrowBalanceUsdc)}` },
          { header: 'Borrow Limit Used', content: `${normalizePercent(borrowUtilizationRatio, 2)}` },
          { header: 'Total Borrow Limit', content: `${normalizeUsdc(borrowLimitUsdc)}` },
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

          <DetailCard
            header="Supplying"
            wrap
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
                className: 'col-icon',
              },
              { key: 'name', header: 'Name', fontWeight: 600, width: '17rem', className: 'col-name' },
              { key: 'apy', header: 'APY', width: '8rem', className: 'col-apy' },
              { key: 'balance', header: 'Balance', width: '13rem', className: 'col-balance' },
              { key: 'suppliedUsdc', header: 'Value', width: '11rem', className: 'col-value' },
              {
                key: 'collateral',
                header: 'Collateral',
                transform: ({ collateral, address }) => (
                  <ToggleButton
                    selected={collateral === 'true'}
                    setSelected={() =>
                      collateral === 'false'
                        ? actionHandler('enterMarket', address)
                        : actionHandler('exitMarket', address)
                    }
                  />
                ),
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
              icon: market.token.icon ?? '',
              tokenSymbol: market.token.symbol,
              name: market.token.symbol,
              balance: humanizeAmount(market.userDeposited, market.token.decimals, 4),
              apy: normalizePercent(market.lendApy, 2),
              suppliedUsdc: normalizeUsdc(market.userDepositedUsdc),
              collateral: market.enteredMarket ? 'true' : 'false',
              address: market.address,
            }))}
          />

          <DetailCard
            header="Borrowing"
            wrap
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
                className: 'col-icon',
              },
              { key: 'name', header: 'Name', fontWeight: 600, width: '17rem', className: 'col-name' },
              { key: 'apy', header: 'APY', width: '8rem', className: 'col-apy' },
              { key: 'balance', header: 'Balance', width: '13rem', className: 'col-balance' },
              { key: 'borrowedUsdc', header: 'Value', width: '11rem', className: 'col-value' },
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
              icon: market.token.icon ?? '',
              tokenSymbol: market.token.symbol,
              name: market.token.symbol,
              balance: humanizeAmount(market.userDeposited, market.token.decimals, 4),
              apy: normalizePercent(market.borrowApy, 2),
              borrowedUsdc: normalizeUsdc(market.userDepositedUsdc),
              address: market.address,
            }))}
          />

          <OpportunitiesCard
            header="Opportunities"
            wrap
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
                className: 'col-icon',
              },
              { key: 'name', header: 'Name', fontWeight: 600, width: '17rem', className: 'col-name' },
              { key: 'supplyAPY', header: 'Lend APY', width: '8rem', className: 'col-lend-apy' },
              { key: 'borrowAPY', header: 'Borrow APY', width: '8rem', className: 'col-borrow-apy' },
              { key: 'liquidity', header: 'Market Liquidity', width: '15rem', className: 'col-market' },
              { key: 'userTokenBalance', header: 'Available to Invest', width: '15rem', className: 'col-available' },
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
              icon: market.token.icon ?? '',
              tokenSymbol: market.token.symbol,
              name: market.token.symbol,
              supplyAPY: normalizePercent(market.lendApy, 2),
              borrowAPY: normalizePercent(market.borrowApy, 2),
              liquidity: normalizeUsdc(market.liquidity, 0),
              userTokenBalance:
                market.token.balance === '0' ? '-' : humanizeAmount(market.token.balance, market.token.decimals, 4),
              address: market.address,
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
          />
        </>
      )}
    </ViewContainer>
  );
};
