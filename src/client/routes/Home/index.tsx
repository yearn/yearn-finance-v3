import styled, { css } from 'styled-components';

import { useAppSelector } from '@hooks';
import { TokensSelectors, VaultsSelectors, IronBankSelectors } from '@store';
import { SummaryCard, InfoCard, ViewContainer } from '@components/app';
import { formatUsd, humanizeAmount, normalizeUsdc, normalizePercent, USDC_DECIMALS, toBN } from '@src/utils';

const halfWidth = css`
  max-width: calc(${({ theme }) => theme.globalMaxWidth} / 2 - ${({ theme }) => theme.layoutPadding} / 2);
`;

const StyledViewContainer = styled(ViewContainer)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: min-content;
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
  const { totalDeposits, totalEarnings, estYearlyYeild, apy } = useAppSelector(VaultsSelectors.selectSummaryData);
  // const { supplyBalance, borrowUtilizationRatio } = useAppSelector(IronBankSelectors.selectSummaryData);
  const walletSummary = useAppSelector(TokensSelectors.selectSummaryData);

  const netWorth = toBN(totalDeposits).plus(walletSummary.totalBalance).toString();
  return (
    <StyledViewContainer>
      <HeaderCard
        header="Welcome"
        items={[
          { header: 'Net Worth', content: `${normalizeUsdc(netWorth)}` },
          { header: 'Earnings', content: `${normalizeUsdc(totalEarnings)}` },
          { header: 'Est. Yearly Yield', content: `${normalizePercent(estYearlyYeild, 2)}` },
        ]}
        variant="secondary"
        cardSize="big"
      />

      <Row>
        <StyledInfoCard
          header="Welcome to Your Yearn Home Screen"
          content="There are many like it, but this one is yours. You can always return here to see a birds eye view of your most important statistics. The sections below show the total balance and utilization of your wallet, and a new section is added for every Yearn product you use, each showing your holdings and performance. Not sure where to start? Check out Vaults!"
        />
        <StyledInfoCard
          header="Yearn passes $5B TVL!"
          content="Total Value Locked (TVL) is a key indicator of the scale of Yearn and DeFi. With $5B TVL, Yearn is the 8th largest DeFi protocol. Yearn is not a bank, but fun fact: the average US bank has $3.1B in deposits according to mx.com.  --------- Over $5B in holdings have been deposited into the Yearn suite of products."
        />
      </Row>

      <StyledSummaryCard
        header="Wallet"
        items={[
          {
            header: 'Available to Invest',
            content: `$ ${humanizeAmount(walletSummary.totalBalance, USDC_DECIMALS, 2)}`,
          },
        ]}
        cardSize="small"
      />

      <StyledSummaryCard
        header="Vaults"
        items={[
          { header: 'Holdings', content: `${normalizeUsdc(totalDeposits)}` },
          { header: 'APY', content: `${apy}%` },
        ]}
        cardSize="small"
      />

      {/* <StyledSummaryCard
        header="Iron Bank"
        items={[
          { header: 'Supply Balance', content: `${normalizeUsdc(supplyBalance)}` },
          { header: 'Borrow Limit Used', content: `${normalizePercent(borrowUtilizationRatio, 2)}` },
        ]}
        cardSize="small"
      /> */}
    </StyledViewContainer>
  );
};
