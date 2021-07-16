import { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';
import { ModalsActions, IronBankActions, IronBankSelectors, WalletSelectors } from '@store';

import { SpinnerLoading, ToggleButton, SearchInput } from '@components/common';
import { SummaryCard, DetailCard, ViewContainer, ActionButtons, TokenIcon, NoWalletCard } from '@components/app';
import { normalizeUsdc, normalizePercent, humanizeAmount, halfWidthCss } from '@src/utils';
import { device } from '@themes/default';

const SearchBarContainer = styled.div`
  margin: 1.2rem;
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
  const { supplyBalance, borrowBalance, borrowUtilizationRatio, netAPY } = useAppSelector(
    IronBankSelectors.selectSummaryData
  );
  const markets = useAppSelector(IronBankSelectors.selectMarkets);
  const supplied = useAppSelector(IronBankSelectors.selectLendMarkets);
  const borrowed = useAppSelector(IronBankSelectors.selectBorrowMarkets);
  const [filteredMarkets, setFilteredMarkets] = useState(markets);

  const ironBankStatus = useAppSelector(IronBankSelectors.selectIronBankStatus);

  useEffect(() => {
    setFilteredMarkets(markets);
  }, [markets]);

  const actionHandler = (action: string, marketAddress: string) => {
    dispatch(IronBankActions.setSelectedMarketAddress({ marketAddress }));
    dispatch(ModalsActions.openModal({ modalName: 'comingSoon' }));
  };

  return (
    <ViewContainer>
      <SummaryCard
        header="Dashboard"
        items={[
          { header: 'Supplied', content: `${normalizeUsdc(supplyBalance)}` },
          { header: 'Borrowed', content: `${normalizeUsdc(borrowBalance)}` },
          { header: 'Borrow Limit Used', content: `${normalizePercent(borrowUtilizationRatio, 2)}` },
          // { header: 'Net APY', content: `${normalizePercent(netAPY, 2)}` }, // TODO netAPY calc in selector
        ]}
        variant="secondary"
        cardSize="small"
      />

      {ironBankStatus.loading && <SpinnerLoading flex="1" width="100%" />}

      {!ironBankStatus.loading && (
        <>
          {!walletIsConnected && <StyledNoWalletCard />}

          <DetailCard
            header="Supplied"
            wrap
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
                className: 'col-icon',
              },
              { key: 'name', header: 'Name', fontWeight: 600, width: '17rem', className: 'col-name' },
              { key: 'apy', header: 'APY', width: '7rem', className: 'col-apy' },
              { key: 'balance', header: 'Balance', width: '13rem', className: 'col-balance' },
              { key: 'suppliedUsdc', header: 'Value', width: '11rem', className: 'col-value' },
              {
                key: 'collateral',
                header: 'Collateral',
                transform: ({ collateral }) => (
                  <ToggleButton selected={collateral === 'true'} setSelected={() => console.log('Enable Collateral')} />
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
              balance: humanizeAmount(market.userBalance, parseInt(market.decimals), 4),
              apy: normalizePercent(market.lendApy, 2),
              suppliedUsdc: normalizeUsdc(market.userDepositedUsdc),
              collateral: market.enteredMarket ? 'true' : 'false',
              address: market.address,
            }))}
          />

          <DetailCard
            header="Borrowed"
            wrap
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
                className: 'col-icon',
              },
              { key: 'name', header: 'Name', fontWeight: 600, width: '17rem', className: 'col-name' },
              { key: 'apy', header: 'APY', width: '7rem', className: 'col-apy' },
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
              balance: humanizeAmount(market.userBalance, parseInt(market.decimals), 4),
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
              { key: 'supplyAPY', header: 'Lend APY', width: '7rem', className: 'col-lend-apy' },
              { key: 'borrowAPY', header: 'Borrow APY', width: '7rem', className: 'col-borrow-apy' },
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
