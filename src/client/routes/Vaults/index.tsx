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
  NoWalletCard,
} from '@components/app';
import { SpinnerLoading, SearchInput } from '@components/common';
import {
  formatPercent,
  humanizeAmount,
  normalizePercent,
  normalizeUsdc,
  USDC_DECIMALS,
  halfWidthCss,
} from '@src/utils';

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
    dispatch(ModalsActions.openModal({ modalName: 'withdrawTx' }));
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
        cardSize="small"
      />

      {vaultsStatus.loading && <SpinnerLoading flex="1" width="100%" />}

      {!vaultsStatus.loading && (
        <>
          <Row>
            <StyledRecommendationsCard
              header="Recommendations"
              items={recommendations.map(({ address, token, apyData }) => ({
                header: 'Vault',
                icon: token.icon ?? '',
                name: token.symbol,
                info: formatPercent(apyData, 2),
                infoDetail: 'EYY',
                // onAction: () => history.push(`/vault/${address}`),
              }))}
            />

            <StyledInfoCard
              header="Set it and forget it."
              content="Yearn Vaults are a passive investing strategy, like supercharged savings accounts. “Recommendations” shows best offers and “Opportunities” lists all available options. Remember, your capital is not locked and is always available for withdrawal. Yearn does the work for you. We identify the optimal opportunities in the market and shift capital, auto-compound, and reblance to maximize your yield. Click ‘Invest’ to get started!"
            />
          </Row>

          {!walletIsConnected && <StyledNoWalletCard />}

          <DetailCard
            header="Deposits"
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
              },
              { key: 'name', header: 'Name' },
              { key: 'apy', header: 'APY' },
              { key: 'balance', header: 'Balance' },
              { key: 'value', header: 'Value' },
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
              { key: 'apy', header: 'APY' },
              { key: 'vaultBalanceUsdc', header: 'Total Assets' },
              { key: 'userTokenBalance', header: 'Available to Invest' },
              {
                key: 'actions',
                transform: ({ vaultAddress }) => (
                  <ActionButtons
                    actions={[
                      { name: 'Invest', handler: () => depositHandler(vaultAddress), disabled: !walletIsConnected },
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
              userTokenBalance:
                vault.token.balance === '0' ? '-' : humanizeAmount(vault.token.balance, vault.token.decimals, 4),
            }))}
            SearchBar={
              <SearchBarContainer>
                <SearchInput
                  searchableData={opportunities}
                  searchableKeys={['name', 'token.symbol', 'token.name']}
                  placeholder=""
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
