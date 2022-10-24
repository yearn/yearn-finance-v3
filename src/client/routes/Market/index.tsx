import _ from 'lodash';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { utils } from 'ethers';

import { useAppSelector, useAppDispatch, useIsMounting, useAppTranslation, useQueryParams } from '@hooks';
import {
  ModalsActions,
  ModalSelectors,
  TokensSelectors,
  VaultsSelectors,
  WalletSelectors,
  AppSelectors,
  NetworkSelectors,
  LinesActions,
  LinesSelectors,
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
import { SpinnerLoading, Text, Tooltip, Input, SearchIcon, Button } from '@components/common';
import {
  humanize,
  USDC_DECIMALS,
  halfWidthCss,
  normalizeAmount,
  formatApy,
  orderApy,
  toBN,
  isCustomApyType,
  filterData,
} from '@utils';
import { getConfig } from '@config';
import { AggregatedCreditLine, VaultView, UseCreditLinesParams } from '@src/core/types';
import { GoblinTown } from '@assets/images';

const StyledHelperCursor = styled.span`
  cursor: help;
`;

const StyledRecommendationsCard = styled(RecommendationsCard)``;

const StyledSliderCard = styled(SliderCard)`
  width: 100%;
  min-height: 24rem;
`;

const DeployLineButton = styled(Button)`
  width: 18rem;
  margin-top: 1em;
  background-color: #00a3ff;
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

interface VaultsQueryParams {
  search: string;
}

export const Market = () => {
  const { t } = useAppTranslation(['common', 'vaults', 'market']);

  const history = useHistory();
  const queryParams = useQueryParams<VaultsQueryParams>();
  const dispatch = useAppDispatch();
  const isMounting = useIsMounting();
  // const { isTablet, isMobile, width: DWidth } = useWindowDimensions();
  const { NETWORK_SETTINGS, CONTRACT_ADDRESSES } = getConfig();
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
  const { totalDeposits, totalEarnings, estYearlyYeild } = useAppSelector(VaultsSelectors.selectSummaryData);
  const opportunities = useAppSelector(VaultsSelectors.selectVaultsOpportunities);
  const [filteredVaults, setFilteredVaults] = useState(opportunities);
  const [search, setSearch] = useState('');
  const activeModal = useAppSelector(ModalSelectors.selectActiveModal);

  const appStatus = useAppSelector(AppSelectors.selectAppStatus);
  const vaultsStatus = useAppSelector(VaultsSelectors.selectVaultsGeneralStatus);
  const tokensStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);
  const generalLoading =
    (appStatus.loading || vaultsStatus.loading || tokensStatus.loading || isMounting) && !activeModal;
  const opportunitiesLoading = generalLoading && !filteredVaults.length;
  // TODO not neeed here
  const addCreditStatus = useAppSelector(LinesSelectors.selectLinesActionsStatusMap);

  const defaultLineCategories: UseCreditLinesParams = {
    // using i18m translation as keys for easy display
    'market:featured.highest-credit': {
      first: 3,
      // NOTE: terrible proxy for total credit (oldest = most). Currently getLines only allows filtering by line metadata not modules'
      orderBy: 'start',
      orderDirection: 'asc',
    },
    'market:featured.highest-revenue': {
      first: 3,
      // NOTE: terrible proxy for total revenue earned (highest % = highest notional). Currently getLines only allows filtering by line metadata not modules'
      orderBy: 'defaultSplit',
      orderDirection: 'desc',
    },
    'market:featured.newest': {
      first: 15,
      orderBy: 'start', // NOTE: theoretically gets lines that start in the future, will have to refine query
      orderDirection: 'desc',
    },
  };
  const fetchMarketData = () => dispatch(LinesActions.getLines(defaultLineCategories));
  const lineCategoriesForDisplay = useAppSelector(LinesSelectors.selectLinesForCategories);
  const getLinesStatus = useAppSelector(LinesSelectors.selectLinesStatusMap).getLines;
  console.log('ready', lineCategoriesForDisplay, getLinesStatus);

  useEffect(() => {
    setSearch(queryParams.search ?? '');

    const expectedCategories = _.keys(defaultLineCategories);
    const currentCategories = _.keys(lineCategoriesForDisplay);

    // const shouldFetch = expectedCategories.reduce((bool, cat) => bool && cuirrentCategories.includes(cat), true);
    let shouldFetch: boolean = false;
    expectedCategories.forEach((cat) => (shouldFetch = shouldFetch || !currentCategories.includes(cat)));

    console.log('should fetch', shouldFetch, currentCategories);
    if (shouldFetch) fetchMarketData();
  }, []);

  useEffect(() => {
    const searchableKeys = ['name', 'displayName', 'token.symbol', 'token.name'];
    const filteredVaults = filterData(opportunities, searchableKeys, search);
    setFilteredVaults(filteredVaults);
    window.history.replaceState(null, '', `market${search ? `?search=${search}` : ''}`);
  }, [opportunities, search]);

  const liquidateBorrowerHandler = () => {
    dispatch(ModalsActions.openModal({ modalName: 'liquidateBorrower' }));
  };

  const createLineHandler = () => {
    dispatch(ModalsActions.openModal({ modalName: 'createLine' }));
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
    return (
      toBN(vault.apyMetadata?.net_apy).gt(0) ||
      isCustomApyType(vault.apyType) ||
      vault.address === CONTRACT_ADDRESSES.YVYFI
    );
  };

  return (
    <ViewContainer>
      {addCreditStatus.loading && (
        <div>
          <p>.... loading......</p>
        </div>
      )}
      {addCreditStatus.error && (
        <div>
          <p>.... ERROR: {addCreditStatus.error}</p>
        </div>
      )}
      <StyledSliderCard
        header={t('vaults:banner.header')}
        Component={
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Text>
              <p>{t('vaults:banner.desc')}</p>
            </Text>
            <DeployLineButton onClick={createLineHandler}>Deploy Line</DeployLineButton>
          </div>
        }
        background={<img src={GoblinTown} alt={'Goblin town or the Citadel?'} />}
      />

      <SummaryCard items={summaryCardItems} cardSize="small" />
      {opportunitiesLoading && <SpinnerLoading flex="1" width="100%" />}

      {!generalLoading && !walletIsConnected && <StyledNoWalletCard />}

      {getLinesStatus.loading || _.isEmpty(lineCategoriesForDisplay) ? (
        <SpinnerLoading flex="1" width="100%" />
      ) : (
        Object.entries(lineCategoriesForDisplay!).map(([key, val]: [string, AggregatedCreditLine[]], i: number) => {
          return (
            <StyledRecommendationsCard
              header={t(key)}
              key={key}
              items={val.map(({ id, borrower, type, spigot, escrow, principal, deposit }) => ({
                icon: '',
                name: borrower + id,
                principal,
                deposit,
                collateral: Object.entries(escrow?.deposits || {})
                  .reduce((sum, [_, val]) => sum.add(val.amount), utils.parseUnits('0', 'ether'))
                  .toString(),
                revenue: Object.values(spigot?.tokenRevenue || {})
                  .reduce((sum, val) => sum.add(val), utils.parseUnits('0', 'ether'))
                  .toString(),
                tags: [spigot ? 'revenue' : '', escrow ? 'collateral' : ''].filter((x) => !!x),
                info: type || 'DAO Line of Credit',
                infoDetail: 'EYY',
                onAction: () => history.push(`/lines/${id}`),
              }))}
            />
          );
        })
      )}

      {/* TODO keep this UI but populate with state.lines.linesMap */}
      {!opportunitiesLoading && (
        <>
          {!opportunitiesLoading && (
            <OpportunitiesCard
              header={t('components.list-card.borrower')}
              data-testid="vaults-opportunities-list"
              metadata={[
                {
                  key: 'displayName',
                  header: t('components.list-card.borrower'),
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
                /** @TODO add tags e.g. spigot here */
                {
                  key: 'vaultBalanceUsdc',
                  header: t('components.list-card.total-assets'),
                  format: ({ vaultBalanceUsdc }) => humanize('usd', vaultBalanceUsdc, USDC_DECIMALS, 0),
                  sortable: true,
                  width: '15rem',
                  className: 'col-assets',
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
                          name: t('components.transaction.liquidate'),
                          handler: () => liquidateBorrowerHandler(),
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
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('components.search-input.search')}
                  Icon={SearchIcon}
                />
              }
              searching={opportunities.length > filteredVaults.length}
              filterLabel="Show 0% APY"
              filterBy={filterVaults}
              onAction={({ address }) => history.push(`/creditLine/${address}`)}
              initialSortBy="apy"
              wrap
            />
          )}
        </>
      )}
    </ViewContainer>
  );
};
