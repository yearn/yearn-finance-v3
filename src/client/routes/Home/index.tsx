import styled, { css } from 'styled-components';

import { useAppSelector } from '@hooks';
import { IronBankSelectors, LabsSelectors, TokensSelectors, VaultsSelectors, WalletSelectors } from '@store';
import { SummaryCard, InfoCard, ViewContainer, NoWalletCard } from '@components/app';
import { Text } from '@components/common';

import { normalizeUsdc, normalizePercent, toBN, halfWidthCss, formatPercent } from '@src/utils';

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

const StyledNoWalletCard = styled(NoWalletCard)`
  grid-column: 1 / 3;
  ${halfWidthCss}
`;

const StyledSummaryCard = styled(SummaryCard)`
  width: 100%;
  grid-column: 1 / 3;
  ${halfWidthCss};
`;

export const Home = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const vaultsSummary = useAppSelector(VaultsSelectors.selectSummaryData);
  const labsSummary = useAppSelector(LabsSelectors.selectSummaryData);
  const ibSummary = useAppSelector(IronBankSelectors.selectSummaryData);
  const walletSummary = useAppSelector(TokensSelectors.selectSummaryData);
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);

  const netWorth = toBN(vaultsSummary.totalDeposits)
    .plus(walletSummary.totalBalance)
    .plus(labsSummary.totalDeposits)
    .plus(ibSummary.supplyBalanceUsdc)
    .toString();
  return (
    <StyledViewContainer>
      <HeaderCard
        header="Dashboard"
        items={[
          { header: 'Total Net Worth', content: `${normalizeUsdc(netWorth)}` },
          { header: 'Vaults Earnings', content: `${normalizeUsdc(vaultsSummary.totalEarnings)}` },
          { header: 'Vaults Est. Yearly Yield', content: `${normalizeUsdc(vaultsSummary.estYearlyYeild)}` },
        ]}
        variant="secondary"
        cardSize="small"
      />

      <Row>
        <StyledInfoCard
          header="Welcome to Your Yearn Home Screen"
          content="There are many like it, but this one is yours. You can always return here to see a birds eye view of your most important statistics. The sections below show the total balance and utilization of your wallet, and a new section is added for every Yearn product you use, each showing your holdings and performance. Not sure where to start? Check out Vaults!"
          cardSize="big"
        />

        <StyledInfoCard
          header="Yearn passes $5B TVL!"
          Component={
            <Text>
              Total Value Locked (TVL) is a key indicator of the scale of Yearn and DeFi. <br />
              With $5B TVL, Yearn is the 8th largest DeFi protocol. Yearn is not a bank, but fun fact: the average US
              bank has $3.1B in deposits according to mx.com.
              <br />
              <br />
              Over $5B in holdings have been deposited into the Yearn suite of products.
            </Text>
          }
          cardSize="big"
        />
      </Row>

      {walletIsConnected && (
        <>
          <StyledSummaryCard
            header="Wallet"
            items={[
              {
                header: 'Available to Invest',
                content: `${normalizeUsdc(walletSummary.totalBalance)}`,
              },
            ]}
            cardSize="small"
          />

          <StyledSummaryCard
            header="Vaults"
            items={[
              { header: 'Holdings', content: `${normalizeUsdc(vaultsSummary.totalDeposits)}` },
              { header: 'APY', content: formatPercent(vaultsSummary.apy, 2) }, // TODO check if normalizePercent is needed.
            ]}
            cardSize="small"
          />

          <StyledSummaryCard
            header="Labs"
            items={[{ header: 'Holdings', content: `${normalizeUsdc(labsSummary.totalDeposits)}` }]}
            cardSize="small"
          />

          <StyledSummaryCard
            header="Iron Bank"
            items={[
              { header: 'Supplied', content: `${normalizeUsdc(ibSummary.supplyBalanceUsdc)}` },
              { header: 'Borrow Limit Used', content: `${normalizePercent(ibSummary.borrowUtilizationRatio, 2)}` },
            ]}
            cardSize="small"
          />
        </>
      )}

      {!walletIsConnected && <StyledNoWalletCard />}
    </StyledViewContainer>
  );
};
