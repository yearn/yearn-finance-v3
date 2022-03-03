import styled from 'styled-components';

import { useAppSelector, useAppTranslation } from '@hooks';
import { LabsSelectors, TokensSelectors, VaultsSelectors, WalletSelectors, NetworkSelectors } from '@store';
import { SummaryCard, ViewContainer, NoWalletCard, Amount } from '@components/app';
import { toBN, halfWidthCss } from '@utils';
import { getConfig } from '@config';

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

const StyledNoWalletCard = styled(NoWalletCard)`
  grid-column: 1 / 3;
  ${halfWidthCss}
`;

const StyledSummaryCard = styled(SummaryCard)`
  width: 100%;
  grid-column: 1 / 3;
  ${halfWidthCss};
`;

export const Portfolio = () => {
  // TODO: Add translation
  const { t } = useAppTranslation(['common', 'home']);
  const { NETWORK_SETTINGS } = getConfig();
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const vaultsSummary = useAppSelector(VaultsSelectors.selectSummaryData);
  const labsSummary = useAppSelector(LabsSelectors.selectSummaryData);
  const walletSummary = useAppSelector(TokensSelectors.selectSummaryData);

  const netWorth = toBN(vaultsSummary.totalDeposits)
    .plus(walletSummary.totalBalance)
    .plus(labsSummary.totalDeposits)
    .toString();

  const summaryCardItems = [
    { header: t('dashboard.total-net-worth'), Component: <Amount value={netWorth} input="usdc" /> },
  ];
  if (currentNetworkSettings.earningsEnabled) {
    summaryCardItems.push(
      {
        header: t('dashboard.vaults-earnings'),
        Component: <Amount value={vaultsSummary.totalEarnings} input="usdc" />,
      },
      {
        header: t('dashboard.vaults-est-yearly-yield'),
        Component: <Amount value={vaultsSummary.estYearlyYeild} input="usdc" />,
      }
    );
  }

  return (
    <StyledViewContainer>
      <HeaderCard items={summaryCardItems} cardSize="small" />

      {walletIsConnected && (
        <>
          <Row>
            <StyledSummaryCard
              header={t('navigation.wallet')}
              items={[
                {
                  header: t('dashboard.available-deposit'),
                  Component: <Amount value={walletSummary.totalBalance} input="usdc" />,
                },
              ]}
              redirectTo="wallet"
              cardSize="small"
            />

            <StyledSummaryCard
              header={t('navigation.vaults')}
              items={[
                {
                  header: t('dashboard.holdings'),
                  Component: <Amount value={vaultsSummary.totalDeposits} input="usdc" />,
                },
                {
                  header: t('dashboard.apy'),
                  Component: <Amount value={vaultsSummary.apy} input="percent" />,
                },
              ]}
              redirectTo="vaults"
              cardSize="small"
            />
          </Row>

          {currentNetworkSettings.labsEnabled && (
            <StyledSummaryCard
              header={t('navigation.labs')}
              items={[
                {
                  header: t('dashboard.holdings'),
                  Component: <Amount value={labsSummary.totalDeposits} input="usdc" />,
                },
              ]}
              redirectTo="labs"
              cardSize="small"
            />
          )}
        </>
      )}

      {!walletIsConnected && <StyledNoWalletCard />}
    </StyledViewContainer>
  );
};
