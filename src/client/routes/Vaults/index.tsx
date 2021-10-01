import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { useAppSelector, useAppDispatch, useIsMounting } from '@hooks';
import {
  ModalsActions,
  ModalSelectors,
  TokensSelectors,
  VaultsActions,
  VaultsSelectors,
  WalletSelectors,
  AppSelectors,
  NetworkSelectors,
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
  Amount,
} from '@components/app';
import { SpinnerLoading, SearchInput, Text } from '@components/common';
import {
  formatPercent,
  humanizeAmount,
  normalizeUsdc,
  halfWidthCss,
  normalizeAmount,
  formatApy,
  orderApy,
} from '@src/utils';
import { getConfig } from '@config';

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
  const isMounting = useIsMounting();
  // const { isTablet, isMobile, width: DWidth } = useWindowDimensions();
  const { NETWORK_SETTINGS } = getConfig();
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
  const { totalDeposits, totalEarnings, estYearlyYeild } = useAppSelector(VaultsSelectors.selectSummaryData);
  const recommendations = useAppSelector(VaultsSelectors.selectRecommendations);
  const deposits = useAppSelector(VaultsSelectors.selectDepositedVaults);
  const opportunities = useAppSelector(VaultsSelectors.selectVaultsOpportunities);
  const [filteredVaults, setFilteredVaults] = useState(opportunities);
  const activeModal = useAppSelector(ModalSelectors.selectActiveModal);

  const appStatus = useAppSelector(AppSelectors.selectAppStatus);
  const vaultsStatus = useAppSelector(VaultsSelectors.selectVaultsGeneralStatus);
  const tokensStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);
  const generalLoading =
    (appStatus.loading || vaultsStatus.loading || tokensStatus.loading || isMounting) && !activeModal;

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

  const summaryCardItems = [{ header: 'Holdings', Component: <Amount value={totalDeposits} input="usdc" /> }];
  if (currentNetworkSettings.earningsEnabled) {
    summaryCardItems.push(
      { header: 'Earnings', Component: <Amount value={totalEarnings} input="usdc" /> },
      { header: 'Est. yearly yield', Component: <Amount value={estYearlyYeild} input="usdc" /> }
    );
  }

  return (
    <ViewContainer>
      <SummaryCard header="Dashboard" items={summaryCardItems} variant="secondary" cardSize="small" />
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
              header="Spend your time wisely"
              Component={
                <Text>
                  <p>
                    Yearn Vaults are a way to use technology to help manage your holdings. You choose the strategy that
                    best suits you, deposit into that vault, and Yearn tech helps maximize yield through shifting
                    capital, auto-compounding, and rebalancing.
                  </p>
                  <p>Custody, and responsibility, for your holdings remains yours.</p>
                  <p>You can withdraw anytime.</p>
                </Text>
              }
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
                key: 'apy',
                header: 'APY',
                format: ({ apyData, apyType }) => formatApy(apyData, apyType),
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
                      { name: 'Deposit', handler: () => depositHandler(address) },
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
              apy: orderApy(vault.apyData, vault.apyType),
              balance: normalizeAmount(vault.userDeposited, vault.token.decimals),
              actions: null,
            }))}
            onAction={({ address }) => history.push(`/vault/${address}`)}
            initialSortBy="userDepositedUsdc"
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
                key: 'apy',
                header: 'APY',
                format: ({ apyData, apyType }) => formatApy(apyData, apyType),
                sortable: true,
                width: '8rem',
                className: 'col-apy',
              },
              {
                key: 'vaultBalanceUsdc',
                header: 'Total assets',
                format: ({ vaultBalanceUsdc }) => normalizeUsdc(vaultBalanceUsdc, 0),
                sortable: true,
                width: '15rem',
                className: 'col-assets',
              },
              {
                key: 'userTokenBalance',
                header: 'Available to deposit',
                format: ({ token }) => (token.balance === '0' ? '-' : humanizeAmount(token.balance, token.decimals, 4)),
                sortable: true,
                width: '15rem',
                className: 'col-available',
              },
              {
                key: 'actions',
                transform: ({ address }) => (
                  <ActionButtons
                    actions={[
                      { name: 'Deposit', handler: () => depositHandler(address), disabled: !walletIsConnected },
                    ]}
                  />
                ),
                align: 'flex-end',
                width: 'auto',
                grow: '1',
              },
            ]}
            data={filteredVaults.map((vault) => ({
              ...vault,
              apy: orderApy(vault.apyData, vault.apyType),
              userTokenBalance: normalizeAmount(vault.token.balance, vault.token.decimals),
              userTokenBalanceUsdc: vault.token.balanceUsdc,
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
            searching={opportunities.length > filteredVaults.length}
            onAction={({ address }) => history.push(`/vault/${address}`)}
            initialSortBy="apy"
            wrap
          />
        </>
      )}
    </ViewContainer>
  );
};
