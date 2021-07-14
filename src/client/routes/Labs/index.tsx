import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@hooks';
import { LabsSelectors, WalletSelectors, ModalsActions, LabsActions } from '@store';
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
import { formatPercent, halfWidthCss, humanizeAmount, normalizeUsdc, USDC_DECIMALS } from '@src/utils';
import { Box, SpinnerLoading, SearchInput } from '@components/common';
import { getConstants } from '@config/constants';

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
  max-width: 100%;
  flex: 1;
`;

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
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const { totalDeposits, totalEarnings, estYearlyYeild } = useAppSelector(LabsSelectors.selectSummaryData);
  const recommendations = useAppSelector(LabsSelectors.selectRecommendations);
  const holdings = useAppSelector(LabsSelectors.selectDepositedLabs);
  const opportunities = useAppSelector(LabsSelectors.selectLabsOpportunities);
  const [filteredOpportunities, setFilteredOpportunities] = useState(opportunities);

  const labsStatus = useAppSelector(LabsSelectors.selectLabsStatus);

  // const tokenSelectorFilter = useAppSelector(TokensSelectors.selectToken);
  // const crvToken = tokenSelectorFilter(CRV);
  // const vaultSelectorFilter = useAppSelector(VaultsSelectors.selectVault);
  // const yv3CrvVault = vaultSelectorFilter(YVTHREECRV);

  useEffect(() => {
    setFilteredOpportunities(opportunities);
  }, [opportunities]);

  const LabHoldingsActions = ({ labAddress }: { labAddress: string }) => {
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

  return (
    <ViewContainer>
      <SummaryCard
        header="Dashboard"
        items={[
          { header: 'Holdings', content: `${normalizeUsdc(totalDeposits)}` },
          // { header: 'Earnings', content: `${normalizeUsdc(totalEarnings)}` },
          // { header: 'Est. Yearly Yield', content: `${normalizePercent(estYearlyYeild, 2)}` },
        ]}
        variant="secondary"
        cardSize="small"
      />

      {labsStatus.loading && (
        <Box height="100%" width="100%" position="relative" display="flex" center paddingTop="4rem">
          <SpinnerLoading flex="1" />
        </Box>
      )}

      {!labsStatus.loading && (
        <>
          <Row>
            <StyledRecommendationsCard
              header="Recommendations"
              items={recommendations.map(({ address, name, apyData, icon }) => ({
                header: 'Special Token',
                icon: icon,
                name: name,
                info: formatPercent(apyData, 2),
                infoDetail: 'EYY',
                // onAction: () => history.push(`/vault/${address}`),
              }))}
            />

            <StyledInfoCard
              header="Welcome to the Lab!"
              content="Ready to get a little experimental? The lab is the place for you. Emerging strategies with unconventional methods of generating yield live here. Be sure to read the “About” sections carefully as “Lab” offers don’t behave like normal “Vaults” and could have token locking, impermanent loss, or other risks. Check out the opportunities below and select your first experiment, guinea pig!"
            />
          </Row>

          {!walletIsConnected && <StyledNoWalletCard />}

          <DetailCard
            header="Holdings"
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
              },
              { key: 'name', header: 'Name' },
              { key: 'apy', header: 'ROI' },
              { key: 'balance', header: 'Balance' },
              { key: 'value', header: 'Value' },
              {
                key: 'actions',
                transform: ({ labAddress }) => <LabHoldingsActions labAddress={labAddress} />,
                align: 'flex-end',
                grow: '1',
              },
            ]}
            data={holdings.map((lab) => ({
              icon: lab.icon,
              tokenSymbol: lab.name,
              name: lab.name,
              balance: humanizeAmount(lab.DEPOSIT.userBalance, parseInt(lab.decimals), 4),
              value: `$ ${humanizeAmount(lab.DEPOSIT.userDepositedUsdc, USDC_DECIMALS, 2)}`,
              apy: formatPercent(lab.apyData, 2),
              labAddress: lab.address,
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
              { key: 'apy', header: 'APY' },
              { key: 'labBalanceUsdc', header: 'Total Assets' },
              { key: 'userTokenBalance', header: 'Available to Invest' },
              {
                key: 'actions',
                transform: ({ labAddress }) => <LabOpportunitiesActions labAddress={labAddress} />,
                align: 'flex-end',
                grow: '1',
              },
            ]}
            data={filteredOpportunities.map((lab) => ({
              icon: lab.icon,
              tokenSymbol: lab.name,
              name: lab.name,
              apy: formatPercent(lab.apyData, 2),
              labBalanceUsdc: `$ ${humanizeAmount(lab.labBalanceUsdc, USDC_DECIMALS, 0)}`,
              userTokenBalance:
                lab.token.balance === '0' ? '-' : humanizeAmount(lab.token.balance, lab.token.decimals, 4),
              labAddress: lab.address,
            }))}
            SearchBar={
              <SearchBarContainer>
                <SearchInput
                  searchableData={opportunities}
                  searchableKeys={['name', 'token.symbol', 'token.name']}
                  placeholder=""
                  onSearch={(data) => setFilteredOpportunities(data)}
                />
              </SearchBarContainer>
            }
          />
        </>
      )}
    </ViewContainer>
  );
};
