import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@hooks';
import { ModalsActions, VaultsActions, VaultsSelectors, WalletSelectors } from '@store';
import {
  SummaryCard,
  DetailCard,
  RecommendationsCard,
  ActionButtons,
  TokenIcon,
  InfoCard,
  ViewContainer,
} from '@components/app';
import { formatPercent, humanizeAmount, normalizePercent, normalizeUsdc, USDC_DECIMALS } from '@src/utils';
import { Box, SpinnerLoading, SearchInput } from '@components/common';

const SearchBarContainer = styled.div`
  margin: 1.2rem;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  grid-gap: ${({ theme }) => theme.layoutPadding};
  flex-wrap: wrap;
  grid-column: 1 / 3;
`;

const StyledInfoCard = styled(InfoCard)`
  max-width: 100%;
  flex: 1;
`;

export const Vaults = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const history = useHistory();
  const dispatch = useAppDispatch();
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const { totalDeposits, totalEarnings, estYearlyYeild } = useAppSelector(VaultsSelectors.selectSummaryData);
  const recommendations = useAppSelector(VaultsSelectors.selectRecommendations);
  const deposits = useAppSelector(VaultsSelectors.selectDepositedVaults);
  const opportunities = useAppSelector(VaultsSelectors.selectVaultsOpportunities);
  const [filteredVaults, setFilteredVaults] = useState(opportunities);

  const vaultsStatus = useAppSelector(VaultsSelectors.selectVaultsStatus);

  useEffect(() => {
    setFilteredVaults(opportunities);
  }, [opportunities]);

  const depositHandler = (vaultAddress: string) => {
    dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress }));
    dispatch(ModalsActions.openModal({ modalName: 'depositTx' }));
  };

  const withdrawHandler = (vaultAddress: string) => {
    dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress }));
    dispatch(ModalsActions.openModal({ modalName: 'withdraw' }));
  };

  return (
    <ViewContainer>
      <SummaryCard
        header="Dashboard"
        items={[
          { header: 'Holdings', content: `${normalizeUsdc(totalDeposits)}` },
          { header: 'Earnings', content: `${normalizeUsdc(totalEarnings)}` },
          { header: 'Est. Yearly Yield', content: `${normalizePercent(estYearlyYeild, 2)}` },
        ]}
        variant="secondary"
        cardSize="big"
      />

      {vaultsStatus.loading && (
        <Box height="100%" width="100%" position="relative" display="flex" center paddingTop="4rem">
          <SpinnerLoading flex="1" />
        </Box>
      )}

      {!vaultsStatus.loading && (
        <>
          <Row>
            <RecommendationsCard
              header="Recommendations"
              items={recommendations.map(({ address, token, apyData }) => ({
                header: 'Vault',
                icon: token.icon ?? '',
                name: token.symbol,
                info: formatPercent(apyData, 2),
                infoDetail: 'EYY',
                action: 'Go to Vault',
                onAction: () => history.push(`/vault/${address}`),
              }))}
            />

            <StyledInfoCard header="Onboarding" content="....." />
          </Row>

          <DetailCard
            header="Deposits"
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
              },
              { key: 'name', header: 'Name' },
              { key: 'balance', header: 'Balance' },
              { key: 'value', header: 'Value' },
              { key: 'apy', header: 'ROI' },
              { key: 'earned', header: 'Earned' },
              {
                key: 'actions',
                transform: ({ vaultAddress }) => (
                  <ActionButtons
                    actions={[
                      { name: 'Invest', handler: () => depositHandler(vaultAddress) },
                      { name: 'Withdraw', handler: () => withdrawHandler(vaultAddress) },
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
              name: vault.token.symbol,
              balance: humanizeAmount(vault.userBalance, parseInt(vault.decimals), 4),
              value: `$ ${humanizeAmount(vault.userDepositedUsdc, USDC_DECIMALS, 2)}`,
              apy: formatPercent(vault.apyData, 2),
              earned: `$ ${humanizeAmount(vault.earned, USDC_DECIMALS, 2)}`,
              vaultAddress: vault.address,
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
              { key: 'name', header: 'Name', fontWeight: 600 },
              { key: 'vaultBalanceUsdc', header: 'Value in $' },
              { key: 'apy', header: 'Growth in %' },
              {
                key: 'actions',
                transform: ({ vaultAddress }) => (
                  <ActionButtons
                    actions={[
                      { name: 'Deposit', handler: () => depositHandler(vaultAddress), disabled: !walletIsConnected },
                    ]}
                  />
                ),
                align: 'flex-end',
                grow: '1',
              },
            ]}
            data={filteredVaults.map((vault) => ({
              icon: vault.token.icon ?? '',
              tokenSymbol: vault.token.symbol,
              name: vault.token.symbol,
              vaultBalanceUsdc: `$ ${humanizeAmount(vault.vaultBalanceUsdc, USDC_DECIMALS, 0)}`,
              apy: formatPercent(vault.apyData, 2),
              vaultAddress: vault.address,
            }))}
            SearchBar={
              <SearchBarContainer>
                <SearchInput
                  searchableData={opportunities}
                  searchableKeys={['name', 'token.symbol', 'token.name']}
                  placeholder="Search"
                  onSearch={(data) => setFilteredVaults(data)}
                />
              </SearchBarContainer>
            }
          />
        </>
      )}
    </ViewContainer>
  );
};
