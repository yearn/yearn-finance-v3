import { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch, useIsMounting, useAppTranslation } from '@hooks';
import {
  LabsSelectors,
  WalletSelectors,
  ModalsActions,
  LabsActions,
  TokensSelectors,
  ModalSelectors,
  AppSelectors,
  NetworkSelectors,
} from '@store';
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
  ApyTooltipData,
} from '@components/app';
import { SpinnerLoading, SearchInput, Text, Tooltip } from '@components/common';
import { formatApy, formatPercent, halfWidthCss, humanize, normalizeAmount, toBN, USDC_DECIMALS } from '@utils';
import { getConstants } from '@config/constants';
import { device } from '@themes/default';
import { GeneralLabView } from '@types';

const SearchBarContainer = styled.div`
  margin: 1.2rem;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  grid-gap: ${({ theme }) => theme.layoutPadding};
  flex-wrap: wrap;
`;

const StyledHelperCursor = styled.span`
  cursor: help;
`;

const StyledRecommendationsCard = styled(RecommendationsCard)`
  ${halfWidthCss}
`;

const StyledInfoCard = styled(InfoCard)`
  flex: 1;
  ${halfWidthCss}
`;

const OpportunitiesCard = styled(DetailCard)`
  @media ${device.tablet} {
    .col-name {
      width: 15rem;
    }
  }
  @media (max-width: 820px) {
    .col-assets {
      display: none;
    }
  }
  @media ${device.mobile} {
    .col-name {
      width: 12rem;
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

const HoldingsCard = styled(DetailCard)`
  @media ${device.tablet} {
    .col-name {
      width: 15rem;
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
      width: 12rem;
    }
    .col-apy {
      display: none;
    }
  }
` as typeof DetailCard;

const StyledNoWalletCard = styled(NoWalletCard)`
  width: 100%;
  ${halfWidthCss}
`;

const ApyTooltip = ({ apyData, apyMetadata, address }: Pick<GeneralLabView, 'apyData' | 'apyMetadata' | 'address'>) => {
  if (!apyMetadata) {
    return <span>{formatPercent(apyData, 2)}</span>;
  }

  return (
    <Tooltip placement="bottom" tooltipComponent={<ApyTooltipData apy={apyMetadata} address={address} />}>
      <StyledHelperCursor>{formatPercent(apyData, 2)}</StyledHelperCursor>
    </Tooltip>
  );
};

export const Labs = () => {
  const { t } = useAppTranslation(['common', 'labs']);

  const { CONTRACT_ADDRESSES, NETWORK_SETTINGS } = getConstants();
  const { YVECRV, YVBOOST, PSLPYVBOOSTETH } = CONTRACT_ADDRESSES;
  const dispatch = useAppDispatch();
  const isMounting = useIsMounting();
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
  const { totalDeposits, apy } = useAppSelector(LabsSelectors.selectSummaryData);
  const recommendations = useAppSelector(LabsSelectors.selectRecommendations);
  const holdings = useAppSelector(LabsSelectors.selectDepositedLabs);
  const opportunities = useAppSelector(LabsSelectors.selectLabsOpportunities);
  const [filteredOpportunities, setFilteredOpportunities] = useState(opportunities);
  const activeModal = useAppSelector(ModalSelectors.selectActiveModal);

  const appStatus = useAppSelector(AppSelectors.selectAppStatus);
  const labsStatus = useAppSelector(LabsSelectors.selectLabsStatus);
  const tokensStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);
  const generalLoading =
    (appStatus.loading || labsStatus.loading || tokensStatus.loading || isMounting) && !activeModal;
  const opportunitiesLoading = generalLoading && !filteredOpportunities.length;
  const holdingsLoading = generalLoading && !holdings.length;

  // const tokenSelectorFilter = useAppSelector(TokensSelectors.selectToken);
  // const crvToken = tokenSelectorFilter(CRV);
  // const vaultSelectorFilter = useAppSelector(VaultsSelectors.selectVault);
  // const yv3CrvVault = vaultSelectorFilter(YVTHREECRV);

  useEffect(() => {
    setFilteredOpportunities(opportunities);
  }, [opportunities]);

  const LabHoldingsActions = ({ labAddress, alert }: { labAddress: string; alert?: string }) => {
    switch (labAddress) {
      case YVECRV:
        return (
          <ActionButtons
            actions={[
              {
                name: t('components.transaction.lock'),
                handler: () => {
                  dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
                  dispatch(ModalsActions.openModal({ modalName: 'backscratcherLockTx' }));
                },
                disabled: !walletIsConnected,
              },
              {
                name: t('components.transaction.claim'),
                handler: () => {
                  dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
                  dispatch(ModalsActions.openModal({ modalName: 'backscratcherClaimTx' }));
                },
                disabled: !walletIsConnected,
              },
              {
                name: t('components.transaction.reinvest'),
                handler: () => {
                  dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
                  dispatch(ModalsActions.openModal({ modalName: 'backscratcherReinvestTx' }));
                },
                disabled: !walletIsConnected,
              },
            ]}
          />
        );
      case YVBOOST:
        return (
          <ActionButtons
            actions={[
              {
                name: t('components.transaction.deposit'),
                handler: () => {
                  dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
                  dispatch(ModalsActions.openModal({ modalName: 'labDepositTx' }));
                },
                disabled: !walletIsConnected,
              },
              {
                name: t('components.transaction.withdraw'),
                handler: () => {
                  dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
                  dispatch(ModalsActions.openModal({ modalName: 'labWithdrawTx' }));
                },
                disabled: !walletIsConnected,
              },
            ]}
          />
        );
      case PSLPYVBOOSTETH:
        return (
          <ActionButtons
            alert={alert}
            actions={[
              {
                name: t('components.transaction.deposit'),
                handler: () => {
                  dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
                  dispatch(ModalsActions.openModal({ modalName: 'labDepositTx' }));
                },
                disabled: !walletIsConnected,
              },
              {
                name: t('components.transaction.stake'),
                handler: () => {
                  dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
                  dispatch(ModalsActions.openModal({ modalName: 'labStakeTx' }));
                },
                disabled: !walletIsConnected,
              },
            ]}
          />
        );
      default:
        return null;
    }
  };

  const LabOpportunitiesActions = ({ labAddress }: { labAddress: string }) => {
    switch (labAddress) {
      case YVECRV:
        return (
          <ActionButtons
            actions={[
              {
                name: t('components.transaction.lock'),
                handler: () => {
                  dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
                  dispatch(ModalsActions.openModal({ modalName: 'backscratcherLockTx' }));
                },
                disabled: !walletIsConnected,
              },
            ]}
          />
        );
      case YVBOOST:
      case PSLPYVBOOSTETH:
        return (
          <ActionButtons
            actions={[
              {
                name: t('components.transaction.deposit'),
                handler: () => {
                  dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
                  dispatch(ModalsActions.openModal({ modalName: 'labDepositTx' }));
                },
                disabled: !walletIsConnected,
              },
            ]}
          />
        );
      default:
        return null;
    }
  };

  const labsHoldingsAlerts = (lab: GeneralLabView): string | undefined => {
    switch (lab.address) {
      case PSLPYVBOOSTETH:
        if (toBN(lab.DEPOSIT.userBalance).gt(0)) {
          return t('components.list-card.available-stake');
        }
        break;

      default:
        break;
    }
  };

  return (
    <ViewContainer>
      <SummaryCard
        header={t('dashboard.header')}
        items={[
          { header: t('dashboard.holdings'), Component: <Amount value={totalDeposits} input="usdc" /> },
          { header: 'APY', content: formatApy(String(apy)) },
          // { header: 'Earnings', content: `${normalizeUsdc(totalEarnings)}` },
          // { header: 'Est. Yearly Yield', content: `${normalizeUsdc(estYearlyYeild)}` },
        ]}
        variant="secondary"
        cardSize="small"
      />

      {opportunitiesLoading && <SpinnerLoading flex="1" width="100%" />}

      {!opportunitiesLoading && (
        <>
          {currentNetworkSettings.labsEnabled ? (
            <Row>
              <StyledRecommendationsCard
                header={t('components.recommendations.header')}
                items={recommendations.map(({ address, displayName, apyData, displayIcon }) => ({
                  // header: 'Special Token',
                  icon: displayIcon,
                  name: displayName,
                  info: formatPercent(apyData, 2),
                  infoDetail: 'EYY',
                  // onAction: () => history.push(`/vault/${address}`),
                }))}
              />
              <StyledInfoCard
                header={t('labs:risks-card.header')}
                Component={
                  <Text>
                    <p>{t('labs:risks-card.desc-1')}</p>
                    <p>{t('labs:risks-card.desc-2')}</p>
                    <p>{t('labs:risks-card.desc-3')}</p>
                  </Text>
                }
              />
            </Row>
          ) : (
            <StyledInfoCard
              header={t('labs:no-labs-card.header', { network: currentNetworkSettings.name })}
              Component={
                <Text>
                  <p>{t('labs:no-labs-card.text')}</p>
                </Text>
              }
            />
          )}

          {!generalLoading && !walletIsConnected && <StyledNoWalletCard />}

          {!holdingsLoading && (
            <HoldingsCard
              header="Holdings"
              metadata={[
                {
                  key: 'displayIcon',
                  transform: ({ displayIcon, displayName }) => <TokenIcon icon={displayIcon} symbol={displayName} />,
                  width: '6rem',
                  className: 'col-icon',
                },
                {
                  key: 'displayName',
                  header: t('components.list-card.name'),
                  sortable: true,
                  fontWeight: 600,
                  width: '17rem',
                  className: 'col-name',
                },
                {
                  key: 'apyData',
                  header: t('components.list-card.apy'),
                  transform: ({ apyData, apyMetadata, address }) => (
                    <ApyTooltip apyData={apyData} apyMetadata={apyMetadata} address={address} />
                  ),
                  sortable: true,
                  width: '8rem',
                  className: 'col-apy',
                },
                {
                  key: 'balance',
                  header: t('components.list-card.balance'),
                  format: (lab) => humanize('amount', lab[lab.mainPositionKey].userBalance, parseInt(lab.decimals), 4),
                  sortable: true,
                  width: '13rem',
                  className: 'col-balance',
                },
                {
                  key: 'value',
                  header: t('components.list-card.value'),
                  format: (lab) => humanize('usd', lab[lab.mainPositionKey].userDepositedUsdc),
                  sortable: true,
                  width: '11rem',
                  className: 'col-value',
                },
                {
                  key: 'actions',
                  transform: ({ address, alert }) => <LabHoldingsActions labAddress={address} alert={alert} />,
                  align: 'flex-end',
                  width: 'auto',
                  grow: '1',
                },
              ]}
              data={holdings.map((lab) => ({
                ...lab,
                balance: normalizeAmount(lab[lab.mainPositionKey].userDeposited, lab.token.decimals),
                value: lab[lab.mainPositionKey].userDepositedUsdc,
                alert: labsHoldingsAlerts(lab) ?? '',
                actions: null,
              }))}
              // TODO Redirect address is wrong
              // onAction={({ address }) => history.push(`/vault/${address}`)}
              initialSortBy="value"
              wrap
            />
          )}

          {!opportunitiesLoading && (
            <OpportunitiesCard
              header={t('components.list-card.opportunities')}
              metadata={[
                {
                  key: 'displayIcon',
                  transform: ({ displayIcon, displayName }) => <TokenIcon icon={displayIcon} symbol={displayName} />,
                  width: '6rem',
                  className: 'col-icon',
                },
                {
                  key: 'displayName',
                  header: t('components.list-card.name'),
                  sortable: true,
                  fontWeight: 600,
                  width: '17rem',
                  className: 'col-name',
                },
                {
                  key: 'apyData',
                  header: t('components.list-card.apy'),
                  transform: ({ apyData, apyMetadata, address }) => (
                    <ApyTooltip apyData={apyData} apyMetadata={apyMetadata} address={address} />
                  ),
                  sortable: true,
                  width: '8rem',
                  className: 'col-apy',
                },
                {
                  key: 'labBalanceUsdc',
                  header: t('components.list-card.total-assets'),
                  format: ({ labBalanceUsdc }) => humanize('usd', labBalanceUsdc, USDC_DECIMALS, 0),
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
                  transform: ({ address }) => <LabOpportunitiesActions labAddress={address} />,
                  align: 'flex-end',
                  width: 'auto',
                  grow: '1',
                },
              ]}
              data={filteredOpportunities.map((lab) => ({
                ...lab,
                userTokenBalance: normalizeAmount(lab.token.balance, lab.token.decimals),
                actions: null,
              }))}
              SearchBar={
                <SearchBarContainer>
                  <SearchInput
                    searchableData={opportunities}
                    searchableKeys={['name', 'displayName', 'token.symbol', 'token.name']}
                    placeholder=""
                    onSearch={(data) => setFilteredOpportunities(data)}
                  />
                </SearchBarContainer>
              }
              searching={opportunities.length > filteredOpportunities.length}
              // TODO Redirect address is wrong
              // onAction={({ address }) => history.push(`/vault/${address}`)}
              initialSortBy="apyData"
              wrap
            />
          )}
        </>
      )}
    </ViewContainer>
  );
};
