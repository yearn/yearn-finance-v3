import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { useAppSelector, useAppDispatch, useIsMounting } from '@hooks';
import {
  LabsSelectors,
  WalletSelectors,
  ModalsActions,
  LabsActions,
  TokensSelectors,
  ModalSelectors,
  AppSelectors,
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
} from '@components/app';
import { SpinnerLoading, SearchInput, Text } from '@components/common';
import { formatPercent, halfWidthCss, humanizeAmount, normalizeAmount, normalizeUsdc, toBN } from '@src/utils';
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
      width: 10rem;
    }
  }
  @media (max-width: 820px) {
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

const HoldingsCard = styled(DetailCard)`
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
` as typeof DetailCard;

const StyledNoWalletCard = styled(NoWalletCard)`
  width: 100%;
  ${halfWidthCss}
`;

export const Labs = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const { YVECRV, YVBOOST, PSLPYVBOOSTETH, CRV, YVTHREECRV } = getConstants().CONTRACT_ADDRESSES;
  const history = useHistory();
  const dispatch = useAppDispatch();
  const isMounting = useIsMounting();
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const { totalDeposits, totalEarnings, estYearlyYeild } = useAppSelector(LabsSelectors.selectSummaryData);
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
                name: 'Lock',
                handler: () => {
                  dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
                  dispatch(ModalsActions.openModal({ modalName: 'backscratcherLockTx' }));
                },
                disabled: !walletIsConnected,
              },
              {
                name: 'Claim',
                handler: () => {
                  dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
                  dispatch(ModalsActions.openModal({ modalName: 'backscratcherClaimTx' }));
                },
                disabled: !walletIsConnected,
              },
              {
                name: 'Reinvest',
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
                name: 'Invest',
                handler: () => {
                  dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
                  dispatch(ModalsActions.openModal({ modalName: 'labDepositTx' }));
                },
                disabled: !walletIsConnected,
              },
              {
                name: 'Withdraw',
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
                name: 'Invest',
                handler: () => {
                  dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
                  dispatch(ModalsActions.openModal({ modalName: 'labDepositTx' }));
                },
                disabled: !walletIsConnected,
              },
              {
                name: 'Stake',
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
                name: 'Lock',
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
                name: 'Invest',
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
          return 'Available to stake';
        }
        break;

      default:
        break;
    }
  };

  return (
    <ViewContainer>
      <SummaryCard
        header="Dashboard"
        items={[
          { header: 'Holdings', Component: <Amount value={totalDeposits} input="usdc" /> },
          // { header: 'Earnings', content: `${normalizeUsdc(totalEarnings)}` },
          // { header: 'Est. Yearly Yield', content: `${normalizeUsdc(estYearlyYeild)}` },
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
              header="These are not risks for ants."
              Component={
                <Text>
                  The emerging strategies you'll find here are the newest and most unconventional around. Be sure to
                  review the “About” sections carefully and make sure you understand token locking, impermanent loss,
                  and other risks before proceeding.
                  <br />
                  As with all Yearn products, you are responsible for educating yourself on the details, and for
                  actively managing your holdings.
                  <br />
                  <br />
                  Welcome to the Lab, but proceed with caution, anon.
                </Text>
              }
            />
          </Row>

          {!walletIsConnected && <StyledNoWalletCard />}

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
                format: (lab) => humanizeAmount(lab[lab.mainPositionKey].userDeposited, lab.token.decimals, 4),
                sortable: true,
                width: '13rem',
                className: 'col-balance',
              },
              {
                key: 'value',
                header: 'Value',
                format: (lab) => normalizeUsdc(lab[lab.mainPositionKey].userDepositedUsdc, 2),
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

          <OpportunitiesCard
            header="Opportunities"
            metadata={[
              {
                key: 'displayIcon',
                transform: ({ displayIcon, displayName }) => <TokenIcon icon={displayIcon} symbol={displayName} />,
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
                key: 'labBalanceUsdc',
                header: 'Total Assets',
                format: ({ labBalanceUsdc }) => normalizeUsdc(labBalanceUsdc, 0),
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
            // TODO Redirect address is wrong
            // onAction={({ address }) => history.push(`/vault/${address}`)}
            initialSortBy="apyData"
            wrap
          />
        </>
      )}
    </ViewContainer>
  );
};
