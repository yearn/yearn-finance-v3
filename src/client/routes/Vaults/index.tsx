import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@hooks';
import {
  ModalsActions,
  ModalSelectors,
  TokensSelectors,
  VaultsActions,
  VaultsSelectors,
  WalletSelectors,
} from '@store';

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
import { formatPercent, humanizeAmount, normalizeUsdc, halfWidthCss, normalizeAmount } from '@src/utils';

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
` as typeof DetailCard;

const DepositsCard = styled(DetailCard)`
  @media ${device.tablet} {
    .col-name {
      width: 10rem;
    }
    .col-balance {
      width: 10rem;
    }
  }
  @media (max-width: 670px) {
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
` as typeof DetailCard;

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
  const activeModal = useAppSelector(ModalSelectors.selectActiveModal);

  const vaultsStatus = useAppSelector(VaultsSelectors.selectVaultsStatus);
  const tokensStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);
  const generalLoading = (vaultsStatus.loading || tokensStatus.loading) && !activeModal;

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

      {generalLoading && <SpinnerLoading flex="1" width="100%" />}

      {!generalLoading && (
        <>
          <Row>
            <StyledRecommendationsCard
              header="Recommendations"
              items={recommendations.map(({ displayName, displayIcon, apyData, address }) => ({
                // header: 'Vault',
                icon: displayIcon,
                name: displayName,
                info: formatPercent(apyData, 2),
                infoDetail: 'EYY',
                onAction: () => history.push(`/vault/${address}`),
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
            metadata={[
              {
                key: 'displayIcon',
                transform: ({ displayIcon, token }) => <TokenIcon icon={displayIcon} symbol={token.symbol} />,
                width: '6rem',
                className: 'col-icon',
              },
              {
                key: 'displayName',
                header: 'Name',
                sortable: true,
                fontWeight: 600,
                width: '17rem',
                className: 'col-name',
              },
              {
                key: 'apyData',
                header: 'APY',
                format: ({ apyData }) => formatPercent(apyData, 2),
                sortable: true,
                width: '8rem',
                className: 'col-apy',
              },
              {
                key: 'balance',
                header: 'Balance',
                format: ({ userDeposited, token }) => humanizeAmount(userDeposited, token.decimals, 4),
                sortable: true,
                width: '13rem',
                className: 'col-balance',
              },
              {
                key: 'userDepositedUsdc',
                header: 'Value',
                format: ({ userDepositedUsdc }) => normalizeUsdc(userDepositedUsdc, 2),
                sortable: true,
                width: '11rem',
                className: 'col-value',
              },
              {
                key: 'earned',
                header: 'Earned',
                format: ({ earned }) => normalizeUsdc(earned, 2),
                sortable: true,
                width: '11rem',
                className: 'col-earned',
              },
              {
                key: 'actions',
                transform: ({ address }) => (
                  <ActionButtons
                    actions={[
                      { name: 'Invest', handler: () => depositHandler(address) },
                      { name: 'Withdraw', handler: () => withdrawHandler(address) },
                    ]}
                  />
                ),
                align: 'flex-end',
                width: 'auto',
                grow: '1',
              },
            ]}
            data={deposits.map((vault) => ({
              ...vault,
              balance: normalizeAmount(vault.userDeposited, vault.token.decimals),
              actions: null,
            }))}
            onAction={({ address }) => history.push(`/vault/${address}`)}
            wrap
          />

          <OpportunitiesCard
            header="Opportunities"
            metadata={[
              {
                key: 'displayIcon',
                transform: ({ displayIcon, token }) => <TokenIcon icon={displayIcon} symbol={token.symbol} />,
                width: '6rem',
                className: 'col-icon',
              },
              {
                key: 'displayName',
                header: 'Name',
                sortable: true,
                fontWeight: 600,
                width: '17rem',
                className: 'col-name',
              },
              {
                key: 'apyData',
                header: 'APY',
                format: ({ apyData }) => formatPercent(apyData, 2),
                sortable: true,
                width: '8rem',
                className: 'col-apy',
              },
              {
                key: 'vaultBalanceUsdc',
                header: 'Total Assets',
                format: ({ vaultBalanceUsdc }) => normalizeUsdc(vaultBalanceUsdc, 0),
                sortable: true,
                width: '15rem',
                className: 'col-assets',
              },
              {
                key: 'userTokenBalance',
                header: 'Available to Invest',
                format: ({ token }) => (token.balance === '0' ? '-' : humanizeAmount(token.balance, token.decimals, 4)),
                sortable: true,
                width: '15rem',
                className: 'col-available',
              },
              {
                key: 'actions',
                transform: ({ address }) => (
                  <ActionButtons
                    actions={[{ name: 'Invest', handler: () => depositHandler(address), disabled: !walletIsConnected }]}
                  />
                ),
                align: 'flex-end',
                width: 'auto',
                grow: '1',
              },
            ]}
            data={filteredVaults.map((vault) => ({
              ...vault,
              userTokenBalance: normalizeAmount(vault.token.balance, vault.token.decimals),
              actions: null,
            }))}
            SearchBar={
              <SearchBarContainer>
                <SearchInput
                  searchableData={opportunities}
                  searchableKeys={['name', 'displayName', 'token.symbol', 'token.name']}
                  placeholder=""
                  onSearch={(data) => setFilteredVaults(data)}
                />
              </SearchBarContainer>
            }
            onAction={({ address }) => history.push(`/vault/${address}`)}
            wrap
          />
        </>
      )}
    </ViewContainer>
  );
};
