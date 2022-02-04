import { useContext, useState } from 'react';
import styled from 'styled-components';

import { formatApy, formatAmount, USDC_DECIMALS, humanize, formatUsd, isCustomApyType } from '@utils';
import { AppContext } from '@context';
import { useAppTranslation } from '@hooks';
import { device } from '@themes/default';
import { DepositTx, WithdrawTx, MigrateTx, TokenIcon, ScanNetworkIcon, ApyTooltipData } from '@components/app';
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
  InfoIcon,
  AddCircleIcon,
  LineChart,
  Tooltip,
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
  flex-shrink: 0;

  a {
    text-decoration: underline;
    color: inherit;
    color: ${({ theme }) => theme.colors.onSurfaceSH1};
  }
`;

const OverviewStrategies = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  overflow-y: auto;
  max-height: 23rem;

  > div:not(:first-child) {
    margin-top: ${({ theme }) => theme.card.padding};
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
  align-items: center;
`;

const TextWithIcon = styled.div`
  display: flex;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  margin-left: 1rem;
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

const StyledChartTab = styled.span<{ active?: boolean }>`
  margin: 10px;
  cursor: pointer;
  color: ${(props) => (props.active ? props.theme.colors.secondary : props.theme.colors.primaryVariant)};
  text-decoration: ${(props) => (props.active ? 'underline' : 'none')};
  text-underline-offset: 4px;
  &: {
    color: ${(props) => props.theme.colors.secondary};
  }
`;

export interface VaultDetailPanelsProps {
  selectedVault: GeneralVaultView;
  chartData?: {
    usd?: any[];
    underlying?: any[];
  };
  chartValue?: {
    usd?: string;
    underlying?: string;
  };
  displayAddToken?: boolean;
  currentNetwork?: Network;
  blockExplorerUrl?: string;
}

const getTooltip = ({
  apyType,
  apyMetadata,
  address,
}: Pick<GeneralVaultView, 'apyMetadata' | 'address' | 'apyType'>) => {
  if (isCustomApyType(apyType) || !apyMetadata) {
    return null;
  }

  return (
    <Tooltip placement="bottom" tooltipComponent={<ApyTooltipData apy={apyMetadata} address={address} />}>
      <StyledIcon Component={InfoIcon} size="1.5rem" />
    </Tooltip>
  );
};

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
  const [selectedUnderlyingData, setSelectedUnderlyingData] = useState(true);
  const strategies: StrategyMetadata[] | null = selectedVault?.strategies ?? null;
  const context = useContext(AppContext);
  const handleTabChange = (selectedTab: string) => {
    setSelectedTab(selectedTab);
  };

  const chartDataVisible = chartData?.underlying && chartValue?.underlying && chartValue?.underlying !== '0';
  const chartValueText = selectedUnderlyingData ? (
    <>
      {formatAmount(chartValue?.underlying ?? '0', 2)} {selectedVault?.token?.symbol}
    </>
  ) : (
    <>{formatUsd(chartValue?.usd)}</>
  );

  const handleAddToken = () => {
    const { address, symbol, decimals, icon } = selectedVault.token;
    if (context?.wallet.addToken) {
      context?.wallet.addToken(address, symbol.substr(0, 11), decimals, icon || '');
    }
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
                <TextWithIcon>
                  <StyledText fontWeight="bold">
                    <span>{formatApy(selectedVault.apyData, selectedVault.apyType)}</span>
                  </StyledText>
                  {getTooltip({
                    apyType: selectedVault.apyType,
                    apyMetadata: selectedVault.apyMetadata,
                    address: selectedVault.address,
                  })}
                </TextWithIcon>
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

          <StyledCardHeader header={t('vaultdetails:overview-panel.about')} />

          {selectedVault.token.description && (
            <OverviewInfo variant="surface" cardSize="micro">
              <StyledCardContent>
                <Markdown>{selectedVault.token.description}</Markdown>
              </StyledCardContent>
            </OverviewInfo>
          )}

          {strategies?.length && (
            <>
              <StyledCardHeader header={t('vaultdetails:overview-panel.strategies')} />

              <OverviewStrategies>
                {strategies.map((strategy) => (
                  <OverviewInfo variant="surface" cardSize="micro">
                    <StyledCardHeader subHeader={strategy.name} />
                    <StyledCardContent>
                      <Markdown>{strategy.description}</Markdown>
                    </StyledCardContent>
                  </OverviewInfo>
                ))}
              </OverviewStrategies>
            </>
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

      {chartDataVisible && (
        <VaultChart>
          <StyledCardHeaderContainer>
            <StyledCardHeader header={t('vaultdetails:performance-panel.header')} />
            <StyledChartTab active={selectedUnderlyingData === true} onClick={() => setSelectedUnderlyingData(true)}>
              {selectedVault?.token?.symbol}
            </StyledChartTab>
            <StyledChartTab active={selectedUnderlyingData === false} onClick={() => setSelectedUnderlyingData(false)}>
              USD
            </StyledChartTab>
          </StyledCardHeaderContainer>

          <ChartValueContainer>
            <ChartValueLabel>{t('vaultdetails:performance-panel.earnings-over-time')}</ChartValueLabel>
            <ChartValue>{chartValueText}</ChartValue>
          </ChartValueContainer>

          <StyledLineChart
            chartData={selectedUnderlyingData ? chartData?.underlying ?? [] : chartData?.usd ?? []}
            tooltipLabel={t('vaultdetails:performance-panel.earnings-over-time')}
            customSymbol={selectedUnderlyingData ? selectedVault?.token?.symbol : undefined}
          />
        </VaultChart>
      )}
    </>
  );
};
