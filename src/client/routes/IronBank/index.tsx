import { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';

import { ModalsActions, IronBankActions, IronBankSelectors, WalletSelectors } from '@store';
import { Box, SpinnerLoading, ToggleButton, SearchInput } from '@components/common';
import { SummaryCard, DetailCard, ViewContainer, ActionButtons, TokenIcon, NoWalletCard } from '@components/app';

import { normalizeUsdc, normalizePercent, humanizeAmount, halfWidthCss } from '@src/utils';

const SearchBarContainer = styled.div`
  margin: 1.2rem;
`;

const StyledNoWalletCard = styled(NoWalletCard)`
  width: 100%;
  ${halfWidthCss}
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

      {ironBankStatus.loading && (
        <Box height="100%" width="100%" position="relative" display="flex" center paddingTop="4rem">
          <SpinnerLoading flex="1" />
        </Box>
      )}

      {!ironBankStatus.loading && (
        <>
          {!walletIsConnected && <StyledNoWalletCard />}

          <DetailCard
            header="Supplied"
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
              },
              { key: 'name', header: 'Name' },
              { key: 'apy', header: 'APY' },
              { key: 'balance', header: 'Balance' },
              { key: 'suppliedUsdc', header: 'Value' },
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
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
              },
              { key: 'name', header: 'Name' },
              { key: 'apy', header: 'APY' },
              { key: 'balance', header: 'Balance' },
              { key: 'borrowedUsdc', header: 'Value' },
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
          <DetailCard
            header="Opportunities"
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
              },
              { key: 'name', header: 'Name' },
              { key: 'supplyAPY', header: 'Lend APY' },
              { key: 'borrowAPY', header: 'Borrow APY' },
              { key: 'liquidity', header: 'Market Liquidity' },
              { key: 'userTokenBalance', header: 'Available to Invest' },
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
