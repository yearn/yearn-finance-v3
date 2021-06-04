import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@hooks';
import { ModalsActions, VaultsActions, VaultsSelectors, TokensActions, WalletSelectors } from '@store';
import {
  SummaryCard,
  DetailCard,
  SearchBar,
  RecomendationsCard,
  ActionButtons,
  TokenIcon,
  InfoCard,
  ViewContainer,
} from '@components/app';
import { formatPercent, humanizeAmount, formatUsd, USDC_DECIMALS } from '@src/utils';

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
  const selectedAddress = useAppSelector(WalletSelectors.selectSelectedAddress);
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
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

  const withdrawHandler = (vaultAddress: string) => {
    dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress }));
    dispatch(ModalsActions.openModal({ modalName: 'withdraw' }));
  };

  return (
    <ViewContainer>
      <SummaryCard
        header="Welcome"
        items={[
          { header: 'Earnings', content: `${formatUsd(totalEarnings)}` },
          { header: 'Deposits', content: `${formatUsd(totalDeposits)}` },
          { header: 'Est. Yearly Yield', content: `${formatUsd(estYearlyYeild)}` },
        ]}
        variant="secondary"
        cardSize="big"
      />

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
        header="Deposits"
        metadata={[
          {
            key: 'icon',
            transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
            width: '4.8rem',
          },
          { key: 'name', header: 'Name' },
          { key: 'balance', header: 'Balance' },
          { key: 'value', header: 'Value' },
          { key: 'apy', header: 'ROI' },
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
            <SearchBar
              searchableData={opportunities}
              searchableKeys={['name', 'token.symbol', 'token.name']}
              onSearch={(data) => setFilteredVaults(data)}
            />
          </SearchBarContainer>
        }
      />
    </ViewContainer>
  );
};
