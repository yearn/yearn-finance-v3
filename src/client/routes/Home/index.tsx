import { useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';
import { VaultsActions, VaultsSelectors } from '@store';
import { SummaryCard, InfoCard } from '@components/app';
import { formatUsd } from '@src/utils';

const Container = styled.div`
  margin: 1.6rem;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
`;

const Column = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-right: 1.6rem;
`;

export const Home = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  const { totalDeposits, totalEarnings, estYearlyYeild } = useAppSelector(VaultsSelectors.selectSummaryData);

  useEffect(() => {
    dispatch(VaultsActions.initiateSaveVaults());
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      dispatch(VaultsActions.getUserVaultsData({}));
    }
  }, [selectedAddress]);

  return (
    <Container>
      <SummaryCard
        items={[
          { header: 'Net Worth', content: `${formatUsd(totalDeposits)}` },
          { header: 'Earnings', content: `${formatUsd(totalEarnings)}` },
          { header: 'Est. Yearly Yield', content: `${formatUsd(estYearlyYeild)}` },
        ]}
        variant="surface"
      />

      <Row>
        <Column>
          <SummaryCard
            header="Wallet"
            items={[
              { header: 'Balance', content: `$ 55,000.00` },
              { header: 'Supported Tokens', content: `02` },
            ]}
            variant="surface"
          />

          <SummaryCard
            header="Vaults"
            items={[
              { header: 'Total Deposits', content: `${formatUsd(totalDeposits)}` },
              { header: 'Total Yield Claimed', content: `${formatUsd(totalEarnings)}` },
            ]}
            variant="surface"
          />
        </Column>

        <Column>
          <InfoCard header="Onboarding" content="....." />
          <InfoCard header="Promo" content="......" />
        </Column>
      </Row>
    </Container>
  );
};
