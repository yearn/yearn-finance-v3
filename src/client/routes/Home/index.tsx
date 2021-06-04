import styled, { css } from 'styled-components';

import { useAppSelector } from '@hooks';
import { TokensSelectors, VaultsSelectors, IronBankSelectors } from '@store';
import { SummaryCard, InfoCard, ViewContainer } from '@components/app';
import { formatUsd, humanizeAmount, normalizeUsdc, normalizePercent, USDC_DECIMALS } from '@src/utils';

const halfWidth = css`
  max-width: calc(${({ theme }) => theme.globalMaxWidth} / 2 - ${({ theme }) => theme.layoutPadding} / 2);
`;

const StyledViewContainer = styled(ViewContainer)`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const HeaderCard = styled(SummaryCard)`
  grid-column: 1 / 3;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  grid-gap: ${({ theme }) => theme.layoutPadding};
  flex-wrap: wrap;
  grid-column: 1 / 3;
`;

const StyledInfoCard = styled(InfoCard)`
  max-width: 100%;
  flex: 1;
`;

const StyledSummaryCard = styled(SummaryCard)`
  width: 100%;
  grid-column: 1 / 3;
  ${halfWidth};
`;

export const Home = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const { totalDeposits, totalEarnings, estYearlyYeild } = useAppSelector(VaultsSelectors.selectSummaryData);
  const { supplyBalance, borrowUtilizationRatio } = useAppSelector(IronBankSelectors.selectSummaryData);
  const walletSummary = useAppSelector(TokensSelectors.selectSummaryData);

  return (
    <StyledViewContainer>
      <HeaderCard
        header="Welcome"
        items={[
          { header: 'Earnings', content: `${normalizeUsdc(totalEarnings)}` },
          { header: 'Net Worth', content: `${normalizeUsdc(totalDeposits)}` }, // TODO: ADD IB + VAULTS SUM
          { header: 'Est. Yearly Yield', content: `${normalizePercent(estYearlyYeild, 2)}` },
        ]}
        variant="secondary"
        cardSize="big"
      />

      <Row>
        <StyledInfoCard header="Onboarding" content="....." />
        <StyledInfoCard header="Promo" content="......" />
      </Row>

      <StyledSummaryCard
        header="Wallet"
        items={[
          { header: 'Balance', content: `$ ${humanizeAmount(walletSummary.totalBalance, USDC_DECIMALS, 2)}` },
          { header: 'Supported Tokens', content: walletSummary.tokensAmount },
        ]}
        cardSize="small"
      />

      <StyledSummaryCard
        header="Vaults"
        items={[
          { header: 'Total Deposits', content: `${normalizeUsdc(totalDeposits)}` },
          { header: 'Total Yield Claimed', content: `${formatUsd(totalEarnings)}` },
        ]}
        cardSize="small"
      />

      <StyledSummaryCard
        header="Iron Bank"
        items={[
          { header: 'Supply Balance', content: `${normalizeUsdc(supplyBalance)}` },
          { header: 'Utilization Ratio', content: `${normalizePercent(borrowUtilizationRatio, 2)}` },
        ]}
        cardSize="small"
      />
    </StyledViewContainer>
  );
};
