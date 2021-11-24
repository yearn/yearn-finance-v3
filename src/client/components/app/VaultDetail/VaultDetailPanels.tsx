import { useContext, useState } from 'react';
import styled from 'styled-components';

import { formatApy, formatUsd, USDC_DECIMALS, humanize } from '@utils';
import { AppContext } from '@context';
import { useAppTranslation } from '@hooks';

import { device } from '@themes/default';
import { DepositTx, WithdrawTx, MigrateTx, TokenIcon, ScanNetworkIcon } from '@components/app';
import {
  Card,
  CardContent,
  CardHeader,
  Tab,
  TabPanel,
  Tabs,
  Text,
  Markdown,
  Icon,
  AddCircleIcon,
  LineChart,
} from '@components/common';
import { MetamaskLogo } from '@assets/images';
import { GeneralVaultView, StrategyMetadata, Network } from '@types';

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
  width: 100%;
`;

const StyledCardContent = styled(CardContent)`
  margin-top: 0.4rem;
`;

const StyledCardHeader = styled(CardHeader)`
  padding: 0;
`;

const StyledCardHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-items: between;
`;

const StyledImg = styled.img`
  object-fit: cover;
  width: 30px;
  height: 30px;
`;

const RelativeContainer = styled.span`
  cursor: pointer;
  position: relative;
`;

const IconOverImage = styled(Icon)`
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 100%;
  position: absolute;
  right: 0;
  top: 0;
  width: 50%;
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
  padding: ${({ theme }) => theme.card.padding};

  a {
    text-decoration: underline;
    color: inherit;
    color: ${({ theme }) => theme.colors.onSurfaceSH1};
  }
`;

const StyledText = styled(Text)`
  display: block;
  color: ${(props) => props.theme.colors.secondary};
  white-space: initial;
`;

const StyledLink = styled.a`
  display: block;
  text-decoration: underline;
  color: inherit;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
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

const Row = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.layoutPadding};
`;

const VaultOverview = styled(Card)`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-self: stretch;
  max-width: 100%;

  > div:not(:first-child) {
    margin-top: ${({ theme }) => theme.card.padding};
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
  selectedVault: GeneralVaultView;
  chartData?: any;
  chartValue?: string;
  displayAddToken?: boolean;
  currentNetwork?: Network;
  blockExplorerUrl?: string;
}

export const VaultDetailPanels = ({
  selectedVault,
  chartData,
  chartValue,
  displayAddToken,
  currentNetwork,
  blockExplorerUrl,
}: VaultDetailPanelsProps) => {
  const { t } = useAppTranslation('vaultdetails');

  const isVaultMigratable = selectedVault.migrationAvailable;
  const hideDeposit = selectedVault.hideIfNoDeposits || isVaultMigratable;
  const [selectedTab, setSelectedTab] = useState(isVaultMigratable ? 'migrate' : hideDeposit ? 'withdraw' : 'deposit');
  const strategy: StrategyMetadata | null = selectedVault?.strategies[0] ?? null;
  const context = useContext(AppContext);
  const handleTabChange = (selectedTab: string) => {
    setSelectedTab(selectedTab);
  };

  const handleAddToken = () => {
    const { address, symbol, decimals, icon } = selectedVault.token;
    context?.wallet.addToken(address, symbol, decimals, icon || '');
  };
  return (
    <>
      <Row>
        <VaultOverview>
          <StyledCardHeaderContainer>
            <StyledCardHeader header={t('vaultdetails:overview-panel.header')} />
            {displayAddToken ? (
              <RelativeContainer onClick={handleAddToken}>
                <StyledImg src={MetamaskLogo} />
                <IconOverImage Component={AddCircleIcon} />
              </RelativeContainer>
            ) : null}
            <ScanNetworkIcon
              currentNetwork={currentNetwork}
              blockExplorerUrl={blockExplorerUrl}
              address={selectedVault.address}
            />
          </StyledCardHeaderContainer>

          <OverviewTokenInfo>
            <TokenLogo variant="background">
              <TokenIcon icon={selectedVault.displayIcon} symbol={selectedVault.displayName} size="xBig" />
            </TokenLogo>

            <TokenInfo>
              <InfoValueTitle>{selectedVault?.displayName}</InfoValueTitle>

              <InfoValueRow>
                <span>{t('vaultdetails:overview-panel.apy')}</span>
                <StyledText fontWeight="bold">{formatApy(selectedVault.apyData, selectedVault.apyType)}</StyledText>
              </InfoValueRow>
              <InfoValueRow>
                <span>{t('vaultdetails:overview-panel.total-assets')}</span>
                <StyledText>{humanize('usd', selectedVault.vaultBalanceUsdc, USDC_DECIMALS, 0)}</StyledText>
              </InfoValueRow>
              <InfoValueRow>
                <span>{t('vaultdetails:overview-panel.type')}</span>
                <StyledText>{selectedVault.token.categories}</StyledText>
              </InfoValueRow>
              <InfoValueRow>
                <span>{t('vaultdetails:overview-panel.web')}</span>
                <StyledLink href={selectedVault.token.website}>{selectedVault.token.website}</StyledLink>
              </InfoValueRow>
            </TokenInfo>
          </OverviewTokenInfo>

          {selectedVault.token.description && (
            <OverviewInfo variant="surface" cardSize="small">
              <StyledCardHeader subHeader={t('vaultdetails:overview-panel.about')} />
              <StyledCardContent>
                <Markdown>{selectedVault.token.description}</Markdown>
              </StyledCardContent>
            </OverviewInfo>
          )}

          {strategy && (
            <OverviewInfo variant="surface" cardSize="small">
              <StyledCardHeader subHeader={t('vaultdetails:overview-panel.strategies')} />
              <StyledCardContent>
                <Markdown>{strategy.description}</Markdown>
              </StyledCardContent>
            </OverviewInfo>
          )}
        </VaultOverview>

        <VaultActions>
          <StyledCardHeader header={t('vaultdetails:vault-actions-panel.header')} />
          <ActionsTabs value={selectedTab} onChange={handleTabChange}>
            {isVaultMigratable && <Tab value="migrate">{t('vaultdetails:vault-actions-panel.migrate')}</Tab>}
            {!hideDeposit && <Tab value="deposit">{t('vaultdetails:vault-actions-panel.deposit')}</Tab>}
            <Tab value="withdraw">{t('vaultdetails:vault-actions-panel.withdraw')}</Tab>
          </ActionsTabs>

          {isVaultMigratable && (
            <StyledTabPanel value="migrate" tabValue={selectedTab}>
              <MigrateTx />
            </StyledTabPanel>
          )}
          {!hideDeposit && (
            <StyledTabPanel value="deposit" tabValue={selectedTab}>
              <DepositTx />
            </StyledTabPanel>
          )}
          <StyledTabPanel value="withdraw" tabValue={selectedTab}>
            <WithdrawTx />
          </StyledTabPanel>
        </VaultActions>
      </Row>

      {chartData && (
        <VaultChart>
          <StyledCardHeader header={t('vaultdetails:performance-panel.header')} />

          <ChartValueContainer>
            <ChartValueLabel>{t('vaultdetails:performance-panel.earnings-over-time')}</ChartValueLabel>
            <ChartValue>{formatUsd(chartValue)}</ChartValue>
          </ChartValueContainer>

          <StyledLineChart
            chartData={chartData}
            tooltipLabel={t('vaultdetails:performance-panel.earnings-over-time')}
          />
        </VaultChart>
      )}
    </>
  );
};
