import { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';
import { ModalsActions, VaultsActions, VaultsSelectors } from '@store';
import { Box, Button } from '@components/common';
import { SummaryCard, DetailCard, SearchBar, RecomendationsCard } from '@components/app';
import { formatPercent, humanizeAmount, formatUsd } from '@src/utils';

const Container = styled.div`
  margin: 1.6rem;
`;

const SearchBarContainer = styled.div`
  margin: 1.2rem;
`;

interface TokenProps {
  address: string;
  symbol: string;
}

const Token = ({ address, symbol }: TokenProps) => {
  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <img
        alt={symbol}
        src={`https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/${address}/logo-128.png`}
        width="36"
        height="36"
      />
    </Box>
  );
};

interface ActionProps {
  type: 'deposits' | 'opportunities';
}

const Actions = ({ type }: ActionProps) => {
  switch (type) {
    case 'deposits':
      return (
        <Box display="flex" flexDirection="row" alignItems="center">
          <Button>Invest</Button>
          <Button>Withdraw</Button>
        </Box>
      );
    case 'opportunities':
      return (
        <Box display="flex" flexDirection="row" alignItems="center">
          <Button>Deposit</Button>
        </Box>
      );
  }
};

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

  const activeModal = useAppSelector(({ modals }) => modals.activeModal);

  useEffect(() => {
    dispatch(VaultsActions.initiateSaveVaults());
  }, []);

  useEffect(() => {
    setFilteredVaults(opportunities);
  }, [opportunities]);

  useEffect(() => {
    if (selectedAddress) {
      dispatch(VaultsActions.getUserVaultsData({}));
    }
  }, [selectedAddress]);

  return (
    <Container>
      active modal: {activeModal}
      <button onClick={() => dispatch(ModalsActions.openModal({ modalName: 'test' }))}>Open test modal</button>
      <button onClick={() => dispatch(ModalsActions.closeModal())}>close modal</button>
      <SummaryCard
        header="My Portfolio"
        items={[
          { header: 'Deposits', content: `${formatUsd(totalDeposits)}` },
          { header: 'Earnings', content: `${formatUsd(totalEarnings)}` },
          { header: 'Est. Yearly Yield', content: `${formatUsd(estYearlyYeild)}` },
        ]}
        variant="surface"
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
            transform: ({ address, symbol }) => <Token address={address} symbol={symbol} />,
            width: '4.8rem',
          },
          { key: 'name', header: 'Name' },
          { key: 'deposited', header: 'Deposited' },
          { key: 'wallet', header: 'Wallet' },
          { key: 'apy', header: 'Return of Investment' },
          { key: 'actions', transform: () => <Actions type="deposits" />, align: 'flex-end', grow: '1' },
        ]}
        data={deposits.map((vault) => ({
          address: vault.token.address,
          symbol: vault.token.symbol,
          name: vault.name,
          deposited: humanizeAmount(vault.userDepositedUsdc, vault.token.decimals, 2),
          wallet: humanizeAmount(vault.token.balanceUsdc, vault.token.decimals, 2),
          apy: formatPercent(vault.apyData, 2),
        }))}
      />

      <DetailCard
        header="Opportunities"
        metadata={[
          {
            key: 'icon',
            transform: ({ address, symbol }) => <Token address={address} symbol={symbol} />,
            width: '4.8rem',
          },
          { key: 'name', header: 'Name' },
          { key: 'vaultBalanceUsdc', header: 'Value in $' },
          { key: 'apy', header: 'Growth in %' },
          { key: 'actions', transform: () => <Actions type="opportunities" />, align: 'flex-end', grow: '1' },
        ]}
        data={filteredVaults.map((vault) => ({
          address: vault.token.address,
          symbol: vault.token.symbol,
          name: vault.name,
          vaultBalanceUsdc: humanizeAmount(vault.vaultBalanceUsdc, vault.token.decimals, 2),
          apy: formatPercent(vault.apyData, 2),
        }))}
        SearchBar={
          <SearchBarContainer>
            <SearchBar
              searchableData={opportunities}
              searchableKeys={['name', 'token.symbol']}
              onSearch={(data) => setFilteredVaults(data)}
            />
          </SearchBarContainer>
        }
      />
    </Container>
  );
};
