import { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';
import { TokensActions, VaultsActions, VaultsSelectors } from '@store';
import { Box, Button } from '@components/common';
import { SummaryCard, DetailCard, SearchBar, RecomendationsCard } from '@components/app';
import { formatPercent, humanizeAmount } from '@src/utils';

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

const Actions = () => {
  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <Button>Invest</Button>
      <Button>Withdraw</Button>
    </Box>
  );
};

export const Vaults = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  const vaults = useAppSelector(VaultsSelectors.selectDepositedVaults);
  // const opportunities = useAppSelector(VaultsSelectors.selectVaultsOportunities);
  const recomendations = useAppSelector(VaultsSelectors.selectRecomendations);
  const [filteredVaults, setFilteredVaults] = useState(vaults);

  useEffect(() => {
    dispatch(VaultsActions.initiateSaveVaults());
  }, []);

  useEffect(() => {
    setFilteredVaults(vaults);
  }, [vaults]);

  useEffect(() => {
    if (selectedAddress) {
      dispatch(VaultsActions.getUserVaultsData({}));
      dispatch(TokensActions.getUserTokens({}));
    }
  }, [selectedAddress]);

  return (
    <Container>
      <SummaryCard
        header="My Portfolio"
        items={[
          { header: 'Deposits', content: '$ 32,170.49' },
          { header: 'Earnings', content: '$ 2,015.10' },
          { header: 'Est. Yearly Yield', content: '$ 12,015.10' },
        ]}
        variant="surface"
      />
      {recomendations.length > 0 && (
        <RecomendationsCard
          header="Recommendations"
          items={[
            {
              header: 'Stablecoin Safe',
              icon: `https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/${recomendations[0].token.address}/logo-128.png`,
              name: recomendations[0].token.symbol,
              info: formatPercent(recomendations[0].apyData, 2),
              infoDetail: 'EYY',
              action: 'Go to Vault',
              onAction: () => console.log('Go'),
            },
            {
              header: 'Stablecoin Safe',
              icon: `https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/${recomendations[1].token.address}/logo-128.png`,
              name: recomendations[1].token.symbol,
              info: formatPercent(recomendations[1].apyData, 2),
              infoDetail: 'EYY',
              action: 'Go to Vault',
              onAction: () => console.log('Go'),
            },
            {
              header: 'Stablecoin Safe',
              icon: `https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/${recomendations[2].token.address}/logo-128.png`,
              name: recomendations[2].token.symbol,
              info: formatPercent(recomendations[2].apyData, 2),
              infoDetail: 'EYY',
              action: 'Go to Vault',
              onAction: () => console.log('Go'),
            },
          ]}
        />
      )}

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
          { key: 'actions', transform: () => <Actions />, align: 'flex-end', grow: '1' },
        ]}
        data={filteredVaults.map((vault) => ({
          address: vault.token.address,
          symbol: vault.token.symbol,
          name: vault.name,
          deposited: humanizeAmount(vault.userDepositedUsdc, vault.token.decimals, 2),
          wallet: humanizeAmount(vault.token.balanceUsdc, vault.token.decimals, 2),
          apy: formatPercent(vault.apyData, 2),
        }))}
        SearchBar={
          <SearchBarContainer>
            <SearchBar
              searchableData={vaults}
              searchableKeys={['name', 'token.symbol']}
              onSearch={(data) => setFilteredVaults(data)}
            />
          </SearchBarContainer>
        }
      />
    </Container>
  );
};
