import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@hooks';
import { TokensSelectors, VaultsSelectors, WalletSelectors } from '@store';
import {
  SummaryCard,
  DetailCard,
  RecomendationsCard,
  ActionButtons,
  TokenIcon,
  InfoCard,
  ViewContainer,
} from '@components/app';
import { formatPercent, humanizeAmount, normalizePercent, normalizeUsdc, USDC_DECIMALS } from '@src/utils';
import { Box, SpinnerLoading, SearchInput } from '@components/common';
import { getConstants } from '../../../config/constants';

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

export const Labs = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const { CRV, YVTHREECRV } = getConstants().CONTRACT_ADDRESSES;
  const history = useHistory();
  const dispatch = useAppDispatch();
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const { totalDeposits, totalEarnings, estYearlyYeild } = useAppSelector(VaultsSelectors.selectSummaryData);
  const recomendations = useAppSelector(VaultsSelectors.selectRecomendations);
  const deposits = useAppSelector(VaultsSelectors.selectDepositedVaults);
  const opportunities = useAppSelector(VaultsSelectors.selectVaultsOportunities);
  const [filteredVaults, setFilteredVaults] = useState(opportunities);

  const vaultsStatus = useAppSelector(VaultsSelectors.selectVaultsStatus);

  const tokenSelectorFilter = useAppSelector(TokensSelectors.selectToken);
  const crvToken = tokenSelectorFilter(CRV);

  const vaultSelectorFilter = useAppSelector(VaultsSelectors.selectVault);
  const yv3CrvVault = vaultSelectorFilter(YVTHREECRV);

  useEffect(() => {
    setFilteredVaults(opportunities);
  }, [opportunities]);

  const actionHandler = (labAddress: string) => {
    // dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
    history.push(`/vault/${labAddress}`);
  };

  return (
    <ViewContainer>
      <SummaryCard
        header="Dashboard"
        items={[
          { header: 'Holdings', content: `${normalizeUsdc(totalEarnings)}` },
          { header: 'Earnings', content: `${normalizeUsdc(totalDeposits)}` },
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
            <RecomendationsCard
              header="Recommendations"
              items={recomendations.map(({ address, token, apyData }) => ({
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
            header="Holdings"
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
              },
              { key: 'name', header: 'Name' },
              { key: 'apy', header: 'ROI' },
              { key: 'balance', header: 'Balance' },
              { key: 'value', header: 'Value' },
              {
                key: 'actions',
                transform: ({ vaultAddress }) => (
                  <ActionButtons actions={[{ name: '>', handler: () => actionHandler(vaultAddress) }]} />
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
              { key: 'tokenBalanceUsdc', header: 'Available to Invest' },
              {
                key: 'actions',
                transform: ({ vaultAddress }) => (
                  <ActionButtons
                    actions={[{ name: '>', handler: () => actionHandler(vaultAddress), disabled: !walletIsConnected }]}
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
              apy: formatPercent(vault.apyData, 2),
              vaultBalanceUsdc: `$ ${humanizeAmount(vault.vaultBalanceUsdc, USDC_DECIMALS, 0)}`,
              tokenBalanceUsdc: normalizeUsdc(vault.token.balanceUsdc),
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
