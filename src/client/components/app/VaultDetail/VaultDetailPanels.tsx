import { useState } from 'react';
import styled from 'styled-components';

import { formatPercent, formatUsd, normalizeUsdc } from '@utils';

import { device } from '@themes/default';
import { TokenIcon } from '@components/app';
import { DepositTx, WithdrawTx } from '@components/app/Transactions';
import { Card, CardContent, CardHeader, Tab, TabPanel, Tabs, Text } from '@components/common';
import { LineChart } from '@components/common/Charts';

import { StrategyDetailedMetadata } from '@yfi/sdk/dist/types/strategy';

const StyledLineChart = styled(LineChart)`
  margin-top: 2.4rem;
`;

const ChartValue = styled(Text)`
  font-size: 2.4rem;
  font-weight: 600;
  margin-top: 0.5rem;
`;

const ChartValueLabel = styled(Text)`
  font-size: 1.4rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.onSurfaceSH1};
`;

const ChartValueContainer = styled.div`
  margin-top: 1.2rem;
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

  @media ${device.tabletL} {
    width: 100%;
  } ;
`;

const OverviewInfo = styled(Card)`
  padding: ${({ theme }) => theme.cardPadding};
`;

const StyledText = styled(Text)`
  display: block;
  color: ${(props) => props.theme.colors.secondary};
  white-space: initial;
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
  max-width: 100%;

  > div:not(:first-child) {
    margin-top: ${({ theme }) => theme.cardPadding};
  }

  @media ${device.mobile} {
    ${OverviewTokenInfo} {
      grid-gap: 2rem;
    }
    ${InfoValueRow} {
      display: flex;
      margin-top: 0.5rem;
      flex-direction: column;
    }
  }

  @media (max-width: 360px) {
    ${OverviewTokenInfo} {
      display: flex;
      flex-direction: column;
    }
  }
`;
export interface VaultDetailPanelsProps {
  selectedVault?: any;
  chartData?: any;
}

export const VaultDetailPanels = ({ selectedVault, chartData }: VaultDetailPanelsProps) => {
  // const { t } = useAppTranslation('common');
  const [selectedTab, setSelectedTab] = useState('deposit');
  const strategy: StrategyDetailedMetadata | null = selectedVault?.strategies[0] ?? null;

  const chartValue = formatUsd(chartData[0].data.slice(-1)[0].y.toString()) ?? '-';

  const handleTabChange = (selectedTab: string) => {
    setSelectedTab(selectedTab);
  };
  return (
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
              <StyledText>{normalizeUsdc(selectedVault.vaultBalanceUsdc, 0)}</StyledText>
            </InfoValueRow>
            <InfoValueRow>
              <span>Type</span>
              <StyledText>{selectedVault.token.categories}</StyledText>
            </InfoValueRow>
            <InfoValueRow>
              <span>Website</span>
              <StyledText>{selectedVault.token.website}</StyledText>
            </InfoValueRow>
          </TokenInfo>
        </OverviewTokenInfo>

        {selectedVault.token.description && (
          <OverviewInfo variant="surface" cardSize="small">
            <StyledCardHeader subHeader="About" />
            <StyledCardContent>{selectedVault.token.description}</StyledCardContent>
          </OverviewInfo>
        )}

        {strategy && (
          <OverviewInfo variant="surface" cardSize="small">
            <StyledCardHeader subHeader="Strategies" />
            <StyledCardContent>{strategy.description}</StyledCardContent>
          </OverviewInfo>
        )}
      </VaultOverview>

      <VaultActions>
        <StyledCardHeader header="Transactions" />

        <ActionsTabs value={selectedTab} onChange={handleTabChange}>
          <Tab value="deposit">Invest</Tab>
          <Tab value="withdraw">Withdraw</Tab>
        </ActionsTabs>

        <StyledTabPanel value="deposit" tabValue={selectedTab}>
          <DepositTx />
        </StyledTabPanel>
        <StyledTabPanel value="withdraw" tabValue={selectedTab}>
          <WithdrawTx />
        </StyledTabPanel>
      </VaultActions>

      {chartData && (
        <VaultChart>
          <StyledCardHeader header="Performance" />

          <ChartValueContainer>
            <ChartValueLabel>Earnings Over Time</ChartValueLabel>
            <ChartValue>{chartValue}</ChartValue>
          </ChartValueContainer>

          <StyledLineChart chartData={chartData} tooltipLabel="Earning Over Time" />
        </VaultChart>
      )}
    </>
  );
};
