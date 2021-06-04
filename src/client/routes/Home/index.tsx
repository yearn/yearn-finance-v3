import { useEffect } from 'react';
import styled, { css } from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';
import { TokensSelectors, VaultsActions, VaultsSelectors } from '@store';
import { SummaryCard, InfoCard, ViewContainer } from '@components/app';
import { formatUsd, humanizeAmount, USDC_DECIMALS } from '@src/utils';

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

const Row = styled.div<{ split?: boolean }>`
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
  const dispatch = useAppDispatch();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  const { totalDeposits, totalEarnings, estYearlyYeild } = useAppSelector(VaultsSelectors.selectSummaryData);
  const walletSummary = useAppSelector(TokensSelectors.selectSummaryData);

  useEffect(() => {
    dispatch(VaultsActions.initiateSaveVaults());
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      dispatch(VaultsActions.getUserVaultsPositions({}));
    }
  }, [selectedAddress]);

  return (
    <StyledViewContainer>
      <HeaderCard
        header="Welcome"
        items={[
          { header: 'Earnings', content: `${formatUsd(totalEarnings)}` },
          { header: 'Net Worth', content: `${formatUsd(totalDeposits)}` },
          { header: 'Est. Yearly Yield', content: `${formatUsd(estYearlyYeild)}` },
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
          { header: 'Total Deposits', content: `${formatUsd(totalDeposits)}` },
          { header: 'Total Yield Claimed', content: `${formatUsd(totalEarnings)}` },
        ]}
        cardSize="small"
      />
    </StyledViewContainer>
  );
};
