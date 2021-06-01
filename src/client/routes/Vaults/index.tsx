import { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';
import { ModalsActions, VaultsActions, VaultsSelectors, TokensActions } from '@store';
import { Box, Button } from '@components/common';
import { SummaryCard, DetailCard, SearchBar, RecomendationsCard } from '@components/app';
import { formatPercent, humanizeAmount, formatUsd, USDC_DECIMALS } from '@src/utils';

const Container = styled.div`
  margin: 1.6rem;
`;

const SearchBarContainer = styled.div`
  margin: 1.2rem;
`;

const VaultActionButton = styled(Button)`
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
      <VaultActionButton onClick={handler}>{name}</VaultActionButton>
    ))}
  </Box>
);

export const Vaults = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  const { totalDeposits, totalEarnings, estYearlyYeild } = useAppSelector(VaultsSelectors.selectSummaryData);
  const recomendations = useAppSelector(VaultsSelectors.selectRecomendations);
  const deposits = useAppSelector(VaultsSelectors.selectDepositedVaults);
  const opportunities = useAppSelector(VaultsSelectors.selectVaultsOportunities);
  const [filteredVaults, setFilteredVaults] = useState(opportunities);

  useEffect(() => {
    dispatch(VaultsActions.initiateSaveVaults());
  }, []);

  useEffect(() => {
    setFilteredVaults(opportunities);
  }, [opportunities]);

  useEffect(() => {
    if (selectedAddress) {
      dispatch(VaultsActions.getUserVaultsPositions({}));
      dispatch(TokensActions.getUserTokens({}));
    }
  }, [selectedAddress]);

  const depositHandler = (vaultAddress: string) => {
    dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress }));
    dispatch(ModalsActions.openModal({ modalName: 'deposit' }));
  };

  return (
    <Container>
      <SummaryCard
        header="My Portfolio"
        items={[
          { header: 'Deposits', content: `${formatUsd(totalDeposits)}` },
          { header: 'Earnings', content: `${formatUsd(totalEarnings)}` },
          { header: 'Est. Yearly Yield', content: `${formatUsd(estYearlyYeild)}` },
        ]}
        variant="secondary"
      />
      <RecomendationsCard
        header="Recommendations"
        items={recomendations.map(({ token, apyData }) => ({
          header: 'Vault',
          icon: token.icon ?? '',
          name: token.symbol,
          info: formatPercent(apyData, 2),
          infoDetail: 'EYY',
          action: 'Go to Vault',
          onAction: () => console.log('Go'),
        }))}
      />
      <DetailCard
        header="Deposits"
        metadata={[
          {
            key: 'icon',
            transform: ({ icon, tokenSymbol }) => <Token icon={icon} symbol={tokenSymbol} />,
            width: '4.8rem',
          },
          { key: 'name', header: 'Name' },
          { key: 'deposited', header: 'Deposited' },
          { key: 'wallet', header: 'Wallet' },
          { key: 'apy', header: 'Return of Investment' },
          {
            key: 'actions',
            transform: ({ vaultAddress }) => (
              <ActionButtons
                actions={[
                  { name: 'Invest', handler: () => depositHandler(vaultAddress) },
                  { name: 'Withdraw', handler: () => console.log('TODO') },
                ]}
              />
            ),
            align: 'flex-end',
            grow: '1',
          },
        ]}
        data={deposits.map((vault) => ({
          icon: vault.token.icon ?? '',
          tokenSymbol: vault.token.symbol,
          name: vault.name,
          deposited: `$ ${humanizeAmount(vault.userDepositedUsdc, USDC_DECIMALS, 2)}`,
          wallet: `$ ${humanizeAmount(vault.token.balanceUsdc, USDC_DECIMALS, 2)}`,
          apy: formatPercent(vault.apyData, 2),
          vaultAddress: vault.address,
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
          { key: 'vaultBalanceUsdc', header: 'Value in $' },
          { key: 'apy', header: 'Growth in %' },
          {
            key: 'actions',
            transform: ({ vaultAddress }) => (
              <ActionButtons actions={[{ name: 'Deposit', handler: () => depositHandler(vaultAddress) }]} />
            ),
            align: 'flex-end',
            grow: '1',
          },
        ]}
        data={filteredVaults.map((vault) => ({
          icon: vault.token.icon ?? '',
          tokenSymbol: vault.token.symbol,
          name: vault.name,
          vaultBalanceUsdc: `$ ${humanizeAmount(vault.vaultBalanceUsdc, USDC_DECIMALS, 2)}`,
          apy: formatPercent(vault.apyData, 2),
          vaultAddress: vault.address,
        }))}
        SearchBar={
          <SearchBarContainer>
            <SearchBar
              searchableData={opportunities}
              searchableKeys={['name', 'token.symbol', 'token.name']}
              onSearch={(data) => setFilteredVaults(data)}
            />
          </SearchBarContainer>
        }
      />
    </Container>
  );
};
