import { useContext, useState } from 'react';
import styled from 'styled-components';
import { Serie } from '@nivo/line';

import { formatApy, formatAmount, USDC_DECIMALS, humanize, formatUsd, formatPercent, isCustomApyType } from '@utils';
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
  margin-top: ${({ theme }) => theme.card.padding};
`;

const ChartValue = styled(Text)`
  display: block;
  font-size: 2.4rem;
  font-weight: 700;
  margin-top: 0.8rem;
`;

const ChartValueLabel = styled(Text)`
  display: block;
  font-size: 1.6rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.titles};
`;

const ChartValueContainer = styled.div`
  margin-top: 1.2rem;
`;

const VaultChart = styled(Card)`
  width: 100%;
`;

const StyledCardContent = styled(CardContent)`
  margin-top: 0.4rem;
  color: ${({ theme }) => theme.colors.texts};
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

const StyledTabPanel = styled(TabPanel)``;

const ActionsTabs = styled(Tabs)``;

const VaultActions = styled(Card)`
  display: flex;
  flex-direction: column;
  width: 50.4rem;
  align-self: stretch;
  padding: 0;

  @media (max-width: 1180px) {
    width: 100%;
  } ;
`;

const OverviewInfo = styled(Card)`
  padding: ${({ theme }) => theme.layoutPadding};
  flex-shrink: 0;

  a {
    text-decoration: underline;
    color: inherit;
  }
`;

const OverviewAbout = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overflow-y: auto;
`;

const StrategiesCard = styled(Card)`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const OverviewStrategies = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overflow-y: auto;
  margin-top: ${({ theme }) => theme.card.padding};
  gap: ${({ theme }) => theme.layoutPadding};
  max-height: 24rem;
`;

const OverviewFees = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: ${({ theme }) => theme.card.padding};
  gap: ${({ theme }) => theme.layoutPadding};
`;

const FeeCard = styled(Card)`
  padding: ${({ theme }) => theme.layoutPadding};
  width: 100%;
`;

const FeeValue = styled(Text)`
  font-size: 2.4rem;
  font-weight: 700;
  margin-top: 0.8rem;
`;

const StyledText = styled(Text)<{ accent?: boolean }>`
  display: block;
  color: ${({ theme }) => theme.colors.titles};
  white-space: initial;

  ${({ theme, accent }) =>
    accent &&
    `
    color: ${theme.colors.primary};
    font-weight: bold;
  `};
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
  color: ${({ theme }) => theme.colors.titles};
  font-size: 1.6rem;
  align-items: center;

  > * {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const TextWithIcon = styled.div`
  display: flex;
  align-items: center;

  ${StyledText} {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 10rem;
  }
`;

const StyledIcon = styled(Icon)`
  margin-left: 1rem;
  flex-shrink: 0;
`;

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  ${InfoValueRow}:not(:first-child) {
    margin-top: 0.8rem;
  }
`;

const TokenLogo = styled(Card)`
  padding: 2.2rem;
  height: min-content;
`;

const OverviewTokenInfo = styled.div`
  display: grid;
  grid-template-columns: min-content 1fr;
  grid-gap: ${({ theme }) => theme.card.padding};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  justify-content: center;
  gap: ${({ theme }) => theme.layoutPadding};
`;

const VaultOverview = styled(Card)`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-self: stretch;
  max-width: 100%;

  > *:not(:first-child) {
    margin-top: 0.8rem;
  }
  > ${StyledCardHeader}:not(:first-child) {
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

  @media (max-width: 460px) {
    ${OverviewTokenInfo} {
      display: flex;
      flex-direction: column;
    }
  }
`;

const StyledChartTab = styled.span<{ active?: boolean }>`
  margin: 10px;
  cursor: pointer;
  color: ${(props) => (props.active ? props.theme.colors.primary : props.theme.colors.texts)};
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
    const { address, symbol, decimals, displayIcon } = selectedVault;

    if (context?.wallet.addToken) {
      context?.wallet.addToken(address, symbol.substring(0, 11), Number(decimals), displayIcon || '');
    }
  };

  const vaultNameTitle = `${selectedVault.name} (${selectedVault.displayName})`;
  const shouldShowChart = (data: Serie[]): boolean => {
    // Only show earnings chart if more than one data point
    return data.length > 0 && data[0].data?.length > 1;
  };

  // TODO: REMOVE THIS QUICKFIX
  let selectedData = selectedUnderlyingData ? chartData?.underlying ?? [] : chartData?.usd ?? [];
  let dataToShow = selectedData;
  const dateRegex = new RegExp(/^\d\d\d\d-\d\d-\d\d$/);
  selectedData.forEach((dataPoint) => {
    if (!dataToShow.length) {
      return;
    }

    dataPoint.data.forEach((point: { x: string }) => {
      if (!dateRegex.test(point.x)) {
        dataToShow = [];
      }
    });
  });

  return (
    <>
      <Row>
        <VaultOverview>
          <StyledCardHeaderContainer>
            <StyledCardHeader header={vaultNameTitle} />
            {displayAddToken ? (
              <RelativeContainer onClick={handleAddToken}>
                <StyledImg src={MetamaskLogo} alt="Add token to Metamask" />
                <IconOverImage Component={AddCircleIcon} />
              </RelativeContainer>
            ) : null}
            <ScanNetworkIcon
              currentNetwork={currentNetwork}
              blockExplorerUrl={blockExplorerUrl}
              address={selectedVault.address}
            />
          </StyledCardHeaderContainer>

          <StyledCardHeader header={t('vaultdetails:overview-panel.header')} />
          <OverviewTokenInfo>
            <TokenLogo variant="background">
              <TokenIcon icon={selectedVault.displayIcon} symbol={selectedVault.displayName} size="xxBig" />
            </TokenLogo>

            <TokenInfo>
              <InfoValueRow>
                <span>{t('vaultdetails:overview-panel.apy')}</span>
                <TextWithIcon>
                  <StyledText accent>
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
                <StyledText>{selectedVault.token.categories || 'N/A'}</StyledText>
              </InfoValueRow>
              <InfoValueRow>
                <span>{t('vaultdetails:overview-panel.web')}</span>
                <StyledLink target="_blank" href={selectedVault.token.website}>
                  {selectedVault.token.website || 'N/A'}
                </StyledLink>
              </InfoValueRow>
            </TokenInfo>
          </OverviewTokenInfo>

          {selectedVault.token.description && (
            <>
              <StyledCardHeader header={t('vaultdetails:overview-panel.about')} />
              <OverviewAbout>
                <OverviewInfo variant="background" cardSize="micro">
                  <StyledCardContent>
                    <Markdown>{selectedVault.token.description}</Markdown>
                  </StyledCardContent>
                </OverviewInfo>
              </OverviewAbout>
            </>
          )}

          <StyledCardHeader header={t('vaultdetails:overview-panel.fees')} />
          <OverviewFees>
            <FeeCard variant="background" cardSize="micro">
              <Text>{t('vaultdetails:overview-panel.management')}</Text>
              <FeeValue>{formatPercent(selectedVault.apyMetadata?.fees.management?.toString() ?? '0', 0)}</FeeValue>
            </FeeCard>
            <FeeCard variant="background" cardSize="micro">
              <Text>{t('vaultdetails:overview-panel.performance')}</Text>
              <FeeValue>{formatPercent(selectedVault.apyMetadata?.fees.performance?.toString() ?? '0', 0)}</FeeValue>
            </FeeCard>
          </OverviewFees>
        </VaultOverview>

        <VaultActions>
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

      {!!strategies?.length && (
        <Row>
          <StrategiesCard>
            <StyledCardHeader header={t('vaultdetails:overview-panel.strategies')} />
            <OverviewStrategies>
              {strategies.map((strategy) => (
                <OverviewInfo variant="background" cardSize="micro" key={strategy.address}>
                  <StyledCardHeader subHeader={strategy.name} />
                  <StyledCardContent>
                    <Markdown>{strategy.description}</Markdown>
                  </StyledCardContent>
                </OverviewInfo>
              ))}
            </OverviewStrategies>
          </StrategiesCard>
        </Row>
      )}

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

          {shouldShowChart(dataToShow) && (
            <StyledLineChart
              chartData={dataToShow}
              tooltipLabel={t('vaultdetails:performance-panel.earnings-over-time')}
              customSymbol={selectedUnderlyingData ? selectedVault?.token?.symbol : undefined}
            />
          )}
        </VaultChart>
      )}
    </>
  );
};
