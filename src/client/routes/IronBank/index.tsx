import { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';

import { ModalsActions, IronBankActions, IronBankSelectors, WalletSelectors } from '@store';
import { ToggleButton } from '@components/common';
import { SummaryCard, DetailCard, SearchBar, ViewContainer, ActionButtons, TokenIcon } from '@components/app';

import { normalizeUsdc, normalizePercent } from '@src/utils';

const SearchBarContainer = styled.div`
  margin: 1.2rem;
`;

export const IronBank = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const { supplyBalance, borrowBalance, borrowUtilizationRatio } = useAppSelector(IronBankSelectors.selectSummaryData);
  const markets = useAppSelector(IronBankSelectors.selectMarkets);
  const supplied = useAppSelector(IronBankSelectors.selectLendMarkets);
  const borrowed = useAppSelector(IronBankSelectors.selectBorrowMarkets);
  const [filteredMarkets, setFilteredMarkets] = useState(markets);

  useEffect(() => {
    setFilteredMarkets(markets);
  }, [markets]);

  const actionHandler = (action: string, marketAddress: string) => {
    dispatch(IronBankActions.setSelectedMarketAddress({ marketAddress }));
    dispatch(ModalsActions.openModal({ modalName: 'test' }));
  };

  return (
    <ViewContainer>
      <SummaryCard
        header="Welcome"
        items={[
          { header: 'Supply Balance', content: `${normalizeUsdc(supplyBalance)}` },
          { header: 'Borrow Balance', content: `${normalizeUsdc(borrowBalance)}` },
          { header: 'Borrow Utilization Ratio', content: `${normalizePercent(borrowUtilizationRatio, 2)}` },
        ]}
        variant="secondary"
      />
      <DetailCard
        header="Supplied"
        metadata={[
          {
            key: 'icon',
            transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
            width: '6rem',
          },
          { key: 'name', header: 'Name' },
          { key: 'balance', header: 'Balance' },
          { key: 'apy', header: 'APY' },
          { key: 'supplied', header: 'Supplied' },
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
          balance: normalizeUsdc(market.token.balanceUsdc),
          apy: normalizePercent(market.lendApy, 2),
          supplied: normalizeUsdc(market.userDepositedUsdc),
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
          { key: 'balance', header: 'Balance' },
          { key: 'apy', header: 'APY' },
          { key: 'borrowed', header: 'Borrowed' },
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
          balance: normalizeUsdc(market.token.balanceUsdc),
          apy: normalizePercent(market.lendApy, 2),
          borrowed: normalizeUsdc(market.userDepositedUsdc),
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
          { key: 'supplyAPY', header: 'Supply APY' },
          { key: 'borrowAPY', header: 'Borrow APY' },
          { key: 'liquidity', header: 'Liquidity' },
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
          address: market.address,
        }))}
        SearchBar={
          <SearchBarContainer>
            <SearchBar
              searchableData={markets}
              searchableKeys={['name', 'token.symbol', 'token.name']}
              onSearch={(data) => setFilteredMarkets(data)}
            />
          </SearchBarContainer>
        }
      />
    </ViewContainer>
  );
};
