import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { useAppSelector, useAppDispatch, useIsMounting, useAppTranslation, usePrevious } from '@hooks';
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
  SliderCard,
  ViewContainer,
  NoWalletCard,
  Amount,
  ApyTooltipData,
} from '@components/app';
import { SpinnerLoading, SearchInput, Text, Tooltip } from '@components/common';
import {
  humanize,
  USDC_DECIMALS,
  halfWidthCss,
  normalizeAmount,
  formatApy,
  orderApy,
  toBN,
  isCustomApyType,
} from '@utils';
import { getConfig } from '@config';
import { VaultView } from '@src/core/types';
import { GoblinTown } from '@assets/images';

const StyledHelperCursor = styled.span`
  cursor: help;
`;

const StyledRecommendationsCard = styled(RecommendationsCard)``;

const StyledSliderCard = styled(SliderCard)`
  width: 100%;
  min-height: 24rem;
`;

const StyledNoWalletCard = styled(NoWalletCard)`
  width: 100%;
  ${halfWidthCss}
`;

const OpportunitiesCard = styled(DetailCard)`
  @media ${device.tablet} {
    .col-name {
      width: 18rem;
    }
  }
  @media (max-width: 750px) {
    .col-assets {
      display: none;
    }
  }
  @media ${device.mobile} {
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
      width: 18rem;
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

const DeprecatedCard = styled(DetailCard)`
  @media ${device.tablet} {
    .col-name {
      width: 18rem;
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

const ApyTooltip = ({
  apyData,
  apyType,
  apyMetadata,
  address,
}: Pick<VaultView, 'apyData' | 'apyMetadata' | 'address' | 'apyType'>) => {
  if (isCustomApyType(apyType) || !apyMetadata) {
    return <span>{formatApy(apyData, apyType)}</span>;
  }

  return (
    <Tooltip placement="bottom" tooltipComponent={<ApyTooltipData apy={apyMetadata} address={address} />}>
      <StyledHelperCursor>{formatApy(apyData, apyType)}</StyledHelperCursor>
    </Tooltip>
  );
};

export const Vaults = () => {
  const { t } = useAppTranslation(['common', 'vaults']);

  const history = useHistory();
  const dispatch = useAppDispatch();
  const isMounting = useIsMounting();
  // const { isTablet, isMobile, width: DWidth } = useWindowDimensions();
  const { NETWORK_SETTINGS, CONTRACT_ADDRESSES } = getConfig();
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
  const { totalDeposits, totalEarnings, estYearlyYeild } = useAppSelector(VaultsSelectors.selectSummaryData);
  const recommendations = useAppSelector(VaultsSelectors.selectRecommendations);
  const deprecated = useAppSelector(VaultsSelectors.selectDeprecatedVaults);
  const deposits = useAppSelector(VaultsSelectors.selectDepositedVaults);
  const opportunities = useAppSelector(VaultsSelectors.selectVaultsOpportunities);
  const previousOpportunities = usePrevious(opportunities);
  const [filteredVaults, setFilteredVaults] = useState(opportunities);
  const activeModal = useAppSelector(ModalSelectors.selectActiveModal);

  const appStatus = useAppSelector(AppSelectors.selectAppStatus);
  const vaultsStatus = useAppSelector(VaultsSelectors.selectVaultsGeneralStatus);
  const tokensStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);
  const generalLoading =
    (appStatus.loading || vaultsStatus.loading || tokensStatus.loading || isMounting) && !activeModal;
  const opportunitiesLoading = generalLoading && !filteredVaults.length;
  const depositsLoading = generalLoading && !deposits.length;

  useEffect(() => {
    if (previousOpportunities?.length !== opportunities.length) {
      setFilteredVaults(opportunities);
    }
  }, [opportunities, previousOpportunities]);

  const depositHandler = (vaultAddress: string) => {
    dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress }));
    dispatch(ModalsActions.openModal({ modalName: 'depositTx' }));
  };

  const withdrawHandler = (vaultAddress: string) => {
    dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress }));
    dispatch(ModalsActions.openModal({ modalName: 'withdrawTx' }));
  };

  const migrateHandler = (vaultAddress: string) => {
    dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress }));
    dispatch(ModalsActions.openModal({ modalName: 'migrateTx' }));
  };

  const summaryCardItems = [
    { header: t('dashboard.holdings'), Component: <Amount value={totalDeposits} input="usdc" /> },
  ];

  if (currentNetworkSettings.earningsEnabled) {
    summaryCardItems.push(
      { header: t('dashboard.earnings'), Component: <Amount value={totalEarnings} input="usdc" /> },
      { header: t('dashboard.est-yearly-yield'), Component: <Amount value={estYearlyYeild} input="usdc" /> }
    );
  }

  const filterVaults = (vault: VaultView) => {
    return toBN(vault.apyMetadata?.net_apy).gt(0) || vault.address === CONTRACT_ADDRESSES.YVYFI;
  };

  return (
    <ViewContainer>
      <StyledSliderCard
        header={t('vaults:banner.header')}
        Component={
          <Text>
            <p>{t('vaults:banner.desc')}</p>
          </Text>
        }
        background={<img src={GoblinTown} alt={'Goblin town or the Citadel?'} />}
      />

      <SummaryCard items={summaryCardItems} cardSize="small" />
      {opportunitiesLoading && <SpinnerLoading flex="1" width="100%" />}

      {!opportunitiesLoading && (
        <>
          <StyledRecommendationsCard
            header={t('components.recommendations.header')}
            items={recommendations.map(({ displayName, displayIcon, apyData, apyType, address }) => ({
              icon: displayIcon,
              name: displayName,
              info: formatApy(apyData, apyType),
              infoDetail: 'EYY',
              onAction: () => history.push(`/vault/${address}`),
            }))}
          />

          {!generalLoading && !walletIsConnected && <StyledNoWalletCard />}

          <DeprecatedCard
            header={t('components.list-card.deprecated')}
            metadata={[
              {
                key: 'displayName',
                header: t('components.list-card.asset'),
                transform: ({ displayIcon, displayName, token }) => (
                  <>
                    <TokenIcon icon={displayIcon} symbol={token.symbol} />
                    <Text ellipsis>{displayName}</Text>
                  </>
                ),
                width: '23rem',
                sortable: true,
                className: 'col-name',
              },

              {
                key: 'apy',
                header: 'APY',
                transform: ({ apyData, apyMetadata, apyType, address }) => (
                  <ApyTooltip apyType={apyType} apyData={apyData} apyMetadata={apyMetadata} address={address} />
                ),
                sortable: true,
                width: '8rem',
                className: 'col-apy',
              },
              {
                key: 'balance',
                header: 'Balance',
                format: ({ userDeposited, token }) => humanize('amount', userDeposited, token.decimals, 4),
                sortable: true,
                width: '13rem',
                className: 'col-balance',
              },
              {
                key: 'userDepositedUsdc',
                header: 'Value',
                format: ({ userDepositedUsdc }) => humanize('usd', userDepositedUsdc),
                sortable: true,
                width: '11rem',
                className: 'col-value',
              },
              {
                key: 'earned',
                header: 'Earned',
                format: ({ earned }) => humanize('usd', earned),
                sortable: true,
                width: '11rem',
                className: 'col-earned',
              },
              {
                key: 'actions',
                transform: ({ address, migrationAvailable }) => (
                  <ActionButtons
                    actions={[
                      { name: 'Migrate', handler: () => migrateHandler(address), disabled: !migrationAvailable },
                      { name: 'Withdraw', handler: () => withdrawHandler(address) },
                    ]}
                  />
                ),
                align: 'flex-end',
                width: 'auto',
                grow: '1',
              },
            ]}
            data={deprecated.map((vault) => ({
              ...vault,
              apy: orderApy(vault.apyData, vault.apyType),
              balance: normalizeAmount(vault.userDeposited, vault.token.decimals),
              actions: null,
            }))}
            onAction={({ address }) => history.push(`/vault/${address}`)}
            initialSortBy="userDepositedUsdc"
            wrap
          />

          {!depositsLoading && (
            <DepositsCard
              header={t('components.list-card.deposits')}
              metadata={[
                {
                  key: 'displayName',
                  header: t('components.list-card.asset'),
                  transform: ({ displayIcon, displayName, token }) => (
                    <>
                      <TokenIcon icon={displayIcon} symbol={token.symbol} />
                      <Text ellipsis>{displayName}</Text>
                    </>
                  ),
                  width: '23rem',
                  sortable: true,
                  className: 'col-name',
                },

                {
                  key: 'apy',
                  header: t('components.list-card.apy'),
                  transform: ({ apyData, apyMetadata, apyType, address }) => (
                    <ApyTooltip apyType={apyType} apyData={apyData} apyMetadata={apyMetadata} address={address} />
                  ),
                  sortable: true,
                  width: '8rem',
                  className: 'col-apy',
                },
                {
                  key: 'balance',
                  header: t('components.list-card.balance'),
                  format: ({ userDeposited, token }) => humanize('amount', userDeposited, token.decimals, 4),
                  sortable: true,
                  width: '13rem',
                  className: 'col-balance',
                },
                {
                  key: 'userDepositedUsdc',
                  header: t('components.list-card.value'),
                  format: ({ userDepositedUsdc }) => humanize('usd', userDepositedUsdc),
                  sortable: true,
                  width: '11rem',
                  className: 'col-value',
                },
                {
                  key: 'earned',
                  header: t('components.list-card.earned'),
                  format: ({ earned }) => (!toBN(earned).isZero() ? humanize('usd', earned) : '-'),
                  sortable: true,
                  width: '11rem',
                  className: 'col-earned',
                },
                {
                  key: 'actions',
                  transform: ({ address }) => (
                    <ActionButtons
                      actions={[
                        { name: t('components.transaction.deposit'), handler: () => depositHandler(address) },
                        { name: t('components.transaction.withdraw'), handler: () => withdrawHandler(address) },
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
          )}

          {!opportunitiesLoading && (
            <OpportunitiesCard
              header={t('components.list-card.opportunities')}
              data-testid="vaults-opportunities-list"
              metadata={[
                {
                  key: 'displayName',
                  header: t('components.list-card.asset'),
                  transform: ({ displayIcon, displayName, token }) => (
                    <>
                      <TokenIcon icon={displayIcon} symbol={token.symbol} />
                      <Text ellipsis>{displayName}</Text>
                    </>
                  ),
                  width: '23rem',
                  sortable: true,
                  className: 'col-name',
                },

                {
                  key: 'apy',
                  header: t('components.list-card.apy'),
                  transform: ({ apyData, apyMetadata, apyType, address }) => (
                    <ApyTooltip apyType={apyType} apyData={apyData} apyMetadata={apyMetadata} address={address} />
                  ),
                  sortable: true,
                  width: '8rem',
                  className: 'col-apy',
                },
                {
                  key: 'vaultBalanceUsdc',
                  header: t('components.list-card.total-assets'),
                  format: ({ vaultBalanceUsdc }) => humanize('usd', vaultBalanceUsdc, USDC_DECIMALS, 0),
                  sortable: true,
                  width: '15rem',
                  className: 'col-assets',
                },
                {
                  key: 'userTokenBalance',
                  header: t('components.list-card.available-deposit'),
                  format: ({ token }) =>
                    token.balance === '0' ? '-' : humanize('amount', token.balance, token.decimals, 4),
                  sortable: true,
                  width: '15rem',
                  className: 'col-available',
                },
                {
                  key: 'actions',
                  transform: ({ address }) => (
                    <ActionButtons
                      actions={[
                        {
                          name: t('components.transaction.deposit'),
                          handler: () => depositHandler(address),
                          disabled: !walletIsConnected,
                        },
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
                <SearchInput
                  searchableData={opportunities}
                  searchableKeys={['name', 'displayName', 'token.symbol', 'token.name']}
                  placeholder={t('components.search-input.search')}
                  onSearch={(data) => setFilteredVaults(data)}
                />
              }
              searching={opportunities.length > filteredVaults.length}
              filterLabel="Show 0% APY"
              filterBy={filterVaults}
              onAction={({ address }) => history.push(`/vault/${address}`)}
              initialSortBy="apy"
              wrap
            />
          )}
        </>
      )}
    </ViewContainer>
  );
};
