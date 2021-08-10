import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { VaultsActions, VaultsSelectors } from '@store';
import { useAppDispatch, useAppSelector } from '@hooks';
import { formatPercent, normalizeUsdc } from '@src/utils';

import { TokenIcon, ViewContainer } from '@components/app';
// import { DepositTx, WithdrawTx } from '@components/app/Transactions';
import { Card, CardContent, CardHeader, SpinnerLoading, Tab, TabPanel, Tabs, Text } from '@components/common';
import { LineChart } from '@components/common/Charts';

const StyledLineChart = styled(LineChart)`
  margin-top: 2.4rem;
`;

const VaultChart = styled(Card)`
  flex: 1 100%;
  width: 100%;
`;

const StyledCardContent = styled(CardContent)`
  margin-top: 0.4rem;
`;

const StyledCardHeader = styled(CardHeader)`
  padding: 0;
`;

const StyledTabPanel = styled(TabPanel)`
  margin-top: 1.5rem;
`;

const ActionsTabs = styled(Tabs)`
  margin-top: 1.2rem;
`;

const VaultActions = styled(Card)`
  display: flex;
  flex-direction: column;
  width: 41.6rem;
  align-self: stretch;
`;

const OverviewInfo = styled(Card)`
  padding: ${({ theme }) => theme.cardPadding};
`;

const StyledText = styled(Text)`
  color: ${(props) => props.theme.colors.secondary};
`;

const InfoValueRow = styled.div`
  display: grid;
  grid-template-columns: 9.6rem 1fr;
  grid-gap: 0.6rem;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.onSurfaceSH1};
  font-size: 1.4rem;
`;

const InfoValueTitle = styled(Text)`
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
  color: ${(props) => props.theme.colors.secondary};
`;

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const TokenLogo = styled(Card)`
  padding: 2.2rem;
  height: min-content;
`;

const OverviewTokenInfo = styled.div`
  display: grid;
  grid-template-columns: min-content 1fr;
  grid-gap: 4.7rem;
`;

const VaultOverview = styled(Card)`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-self: stretch;
  margin-top: -${({ theme }) => theme.cardPadding};

  > * {
    margin-top: ${({ theme }) => theme.cardPadding};
  }
`;

const VaultDetailView = styled(ViewContainer)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

export interface VaultDetailRouteParams {
  vaultAddress: string;
}

export const VaultDetail = () => {
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const { vaultAddress } = useParams<VaultDetailRouteParams>();
  const [selectedTab, setSelectedTab] = React.useState('deposit');

  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const vaultsStatus = useAppSelector(VaultsSelectors.selectVaultsStatus);

  const generalLoading = vaultsStatus.loading;

  useEffect(() => {
    dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress }));
  }, []);

  const handleTabChange = (selectedTab: string) => {
    setSelectedTab(selectedTab);
  };

  const data = [
    {
      id: 'japan',
      // color: '#d9269a',
      data: [
        { x: '2019-05-01', y: 2 },
        { x: '2019-06-01', y: 7 },
        { x: '2019-09-01', y: 1 },
      ],
    },
  ];

  return (
    <VaultDetailView>
      {generalLoading && <SpinnerLoading flex="1" width="100%" height="100%" />}

      {!generalLoading && selectedVault && (
        <>
          <VaultOverview>
            <StyledCardHeader header="Overview" />

            <OverviewTokenInfo>
              <TokenLogo variant="background">
                <TokenIcon icon={selectedVault.token.icon} symbol={selectedVault.token.name} size="xBig" />
              </TokenLogo>

              <TokenInfo>
                <InfoValueTitle>{selectedVault?.displayName}</InfoValueTitle>

                <InfoValueRow>
                  <span>APY</span>
                  <StyledText fontWeight="bold">{formatPercent(selectedVault.apyData, 2)}</StyledText>
                </InfoValueRow>
                <InfoValueRow>
                  <span>Total Assets</span>
                  <StyledText ellipsis>{normalizeUsdc(selectedVault.vaultBalanceUsdc, 0)}</StyledText>
                </InfoValueRow>
                <InfoValueRow>
                  <span>Type</span>
                  <StyledText ellipsis>Stablecoin</StyledText>
                </InfoValueRow>
                <InfoValueRow>
                  <span>Website</span>
                  <StyledText ellipsis>https://www.google.com</StyledText>
                </InfoValueRow>
              </TokenInfo>
            </OverviewTokenInfo>

            <OverviewInfo variant="surface" cardSize="small">
              <StyledCardHeader subHeader="About" />
              <StyledCardContent>
                USDC is a fully collteralized US dollar stable coin. It’s the bridge between dollars and trading on
                cryptocurrency exchange.
              </StyledCardContent>
            </OverviewInfo>

            <OverviewInfo variant="surface" cardSize="small">
              <StyledCardHeader subHeader="Strategies" />
              <StyledCardContent>
                This vault supplies the USDC on Compound and borrows an additional amount of USDC to maximize COMP
                farming. ( 1 of 9 )
              </StyledCardContent>
            </OverviewInfo>
          </VaultOverview>

          <VaultActions>
            <StyledCardHeader header="Transactions" />

            <ActionsTabs value={selectedTab} onChange={handleTabChange}>
              <Tab value="deposit">Deposit</Tab>
              <Tab value="withdraw">Withdraw</Tab>
            </ActionsTabs>

            <StyledTabPanel value="deposit" tabValue={selectedTab}>
              {/* <DepositTx /> */}
            </StyledTabPanel>
            <StyledTabPanel value="withdraw" tabValue={selectedTab}>
              {/* <WithdrawTx /> */}
            </StyledTabPanel>
          </VaultActions>

          <VaultChart>
            <StyledCardHeader header="Performance" />
            <StyledLineChart chartData={data} tooltipLabel="Earning Over Time" />
          </VaultChart>
        </>
      )}
    </VaultDetailView>
  );
};
