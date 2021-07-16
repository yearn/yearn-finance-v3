import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@hooks';
import { ModalsActions, VaultsActions, VaultsSelectors, WalletSelectors } from '@store';

import { device } from '@themes/default';

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

const OpportunitiesCard = styled(DetailCard)`
  @media ${device.tablet} {
    .col-name {
      width: 10rem;
    }
  }
  @media (max-width: 750px) {
    .col-assets {
      display: none;
    }
  }
  @media ${device.mobile} {
    .col-name {
      width: 7rem;
    }
    .col-available {
      width: 10rem;
    }
  }
  @media (max-width: 450px) {
    .col-available {
      display: none;
    }
  }
`;

const DepositsCard = styled(DetailCard)`
  @media ${device.tablet} {
    .col-name {
      width: 10rem;
    }
    .col-balance {
      width: 10rem;
    }
  }
  @media (max-width: 650px) {
    .col-value {
      display: none;
    }
  }
  @media ${device.mobile} {
    .col-name {
      width: 7rem;
    }
    .col-apy {
      display: none;
    }
  }
  @media (max-width: 500px) {
    .col-earned {
      display: none;
    }
  }
`;

export const Vaults = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const history = useHistory();
  const dispatch = useAppDispatch();
  // const { isTablet, isMobile, width: DWidth } = useWindowDimensions();
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
          { header: 'Est. Yearly Yield', content: `${normalizeUsdc(estYearlyYeild)}` },
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
                // header: 'Vault',
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

          <DepositsCard
            header="Deposits"
            wrap
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
                className: 'col-icon',
              },
              { key: 'name', header: 'Name', fontWeight: 600, width: '17rem', className: 'col-name' },
              { key: 'apy', header: 'APY', width: '7rem', className: 'col-apy' },
              { key: 'balance', header: 'Balance', width: '13rem', className: 'col-balance' },
              { key: 'value', header: 'Value', width: '11rem', className: 'col-value' },
              { key: 'earned', header: 'Earned', width: '10rem', className: 'col-earned' },
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
                width: 'auto',
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

          <OpportunitiesCard
            header="Opportunities"
            wrap
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
                className: 'col-icon',
              },
              { key: 'name', header: 'Name', fontWeight: 600, width: '17rem', className: 'col-name' },
              { key: 'apy', header: 'APY', width: '7rem', className: 'col-apy' },
              { key: 'vaultBalanceUsdc', header: 'Total Assets', width: '15rem', className: 'col-assets' },
              { key: 'userTokenBalance', header: 'Available to Invest', width: '15rem', className: 'col-available' },
              // { key: 'apy', header: 'APY', hide: DWidth <= 400 },
              // { key: 'vaultBalanceUsdc', header: 'Total Assets', hide: isTablet },
              // { key: 'userTokenBalance', header: 'Available to Invest', hide: isTablet },
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
                width: 'auto',
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
