import { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';
import { ModalsActions, IronBankActions, IronBankSelectors, TokensActions } from '@store';
import { Box, Button, ToggleButton } from '@components/common';
import { SummaryCard, DetailCard, SearchBar } from '@components/app';
import { normalizeUsdc, normalizePercent } from '@src/utils';

const Container = styled.div`
  margin: 1.6rem;
`;

const SearchBarContainer = styled.div`
  margin: 1.2rem;
`;

const ActionButton = styled(Button)`
  background: ${({ theme }) => theme.colors.vaultActionButton.background};
  color: ${({ theme }) => theme.colors.vaultActionButton.color};
  border: 2px solid ${({ theme }) => theme.colors.vaultActionButton.borderColor};
  padding: 0 1.6rem;
`;

interface TokenProps {
  icon: string;
  symbol: string;
}

const Token = ({ icon, symbol }: TokenProps) => {
  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <img alt={symbol} src={icon} width="36" height="36" />
    </Box>
  );
};

interface ActionProps {
  actions: Array<{
    name: string;
    handler: () => void;
  }>;
}

const ActionButtons = ({ actions }: ActionProps) => (
  <Box display="grid" gridTemplateColumns={`repeat(${actions.length}, 1fr)`} flexDirection="row" alignItems="center">
    {actions.map(({ name, handler }) => (
      <ActionButton onClick={handler}>{name}</ActionButton>
    ))}
  </Box>
);

export const IronBank = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  const { supplyBalance, borrowBalance, borrowUtilizationRatio } = useAppSelector(IronBankSelectors.selectSummaryData);
  const markets = useAppSelector(IronBankSelectors.selectMarkets);
  const supplied = useAppSelector(IronBankSelectors.selectLendMarkets);
  const borrowed = useAppSelector(IronBankSelectors.selectBorrowMarkets);
  const [filteredMarkets, setFilteredMarkets] = useState(markets);

  useEffect(() => {
    dispatch(IronBankActions.initiateIronBank());
  }, []);

  useEffect(() => {
    setFilteredMarkets(markets);
  }, [markets]);

  useEffect(() => {
    if (selectedAddress) {
      dispatch(IronBankActions.getUserMarketsPositions({}));
      dispatch(IronBankActions.getUserMarketsMetadata({}));
      dispatch(TokensActions.getUserTokens({}));
    }
  }, [selectedAddress]);

  const actionHandler = (action: string, marketAddress: string) => {
    dispatch(IronBankActions.setSelectedMarketAddress({ marketAddress }));
    dispatch(ModalsActions.openModal({ modalName: 'test' }));
  };

  return (
    <Container>
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
            transform: ({ icon, tokenSymbol }) => <Token icon={icon} symbol={tokenSymbol} />,
            width: '4.8rem',
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
          name: market.name,
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
            transform: ({ icon, tokenSymbol }) => <Token icon={icon} symbol={tokenSymbol} />,
            width: '4.8rem',
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
          name: market.name,
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
            transform: ({ icon, tokenSymbol }) => <Token icon={icon} symbol={tokenSymbol} />,
            width: '4.8rem',
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
                  { name: 'Supply', handler: () => actionHandler('supply', address) },
                  { name: 'Borrow', handler: () => actionHandler('borrow', address) },
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
          name: market.name,
          supplyAPY: normalizePercent(market.lendApy, 2),
          borrowAPY: normalizePercent(market.borrowApy, 2),
          liquidity: normalizeUsdc(market.liquidity),
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
    </Container>
  );
};
