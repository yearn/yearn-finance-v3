import styled from 'styled-components';

import { useAppSelector } from '@hooks';
import {
  IronBankSelectors,
  LabsSelectors,
  TokensSelectors,
  VaultsSelectors,
  WalletSelectors,
  NetworkSelectors,
} from '@store';
import { SummaryCard, InfoCard, ViewContainer, NoWalletCard, Amount } from '@components/app';
import { Text } from '@components/common';
import { toBN, halfWidthCss } from '@src/utils';
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

const StyledLink = styled.a`
  white-space: initial;
  text-decoration: underline;
  color: inherit;
`;

export const Home = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const { NETWORK_SETTINGS } = getConfig();
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const vaultsSummary = useAppSelector(VaultsSelectors.selectSummaryData);
  const labsSummary = useAppSelector(LabsSelectors.selectSummaryData);
  const ibSummary = useAppSelector(IronBankSelectors.selectSummaryData);
  const walletSummary = useAppSelector(TokensSelectors.selectSummaryData);

  const netWorth = toBN(vaultsSummary.totalDeposits)
    .plus(walletSummary.totalBalance)
    .plus(labsSummary.totalDeposits)
    .plus(ibSummary.supplyBalanceUsdc)
    .toString();

  const summaryCardItems = [{ header: 'Total net worth', Component: <Amount value={netWorth} input="usdc" /> }];
  if (currentNetworkSettings.earningsEnabled) {
    summaryCardItems.push(
      { header: 'Vaults earnings', Component: <Amount value={vaultsSummary.totalEarnings} input="usdc" /> },
      {
        header: 'Vaults est. yearly yield',
        Component: <Amount value={vaultsSummary.estYearlyYeild} input="usdc" />,
      }
    );
  }

  return (
    <StyledViewContainer>
      <HeaderCard header="Dashboard" items={summaryCardItems} variant="secondary" cardSize="small" />
      <Row>
        <StyledInfoCard
          header="Welcome to your Yearn home screen"
          Component={
            <Text>
              <p>
                There are many like it, but this one is yours. You can always return here for a bird's-eye view of your
                holdings. The cards below show the total balance and utilization of your wallet, and the holdings and
                performance for every Yearn product you use.
              </p>
              <p>Not sure where to start? Check out “Vaults” on the left side navigation.</p>
            </Text>
          }
          cardSize="big"
        />

        <StyledInfoCard
          header="Beta is here!"
          Component={
            <Text>
              <p>
                This website is still in beta, and will likely contain bugs. If you find a bug or would like to provide
                feedback, please let us know on <StyledLink href="https://discord.gg/Rw9zA3GbyE">Discord</StyledLink>.
              </p>
            </Text>
          }
          cardSize="big"
        />
      </Row>

      {walletIsConnected && (
        <>
          <Row>
            <StyledSummaryCard
              header="Wallet"
              items={[
                {
                  header: 'Available to deposit',
                  Component: <Amount value={walletSummary.totalBalance} input="usdc" />,
                },
              ]}
              cardSize="small"
            />

            {currentNetworkSettings.ironBankEnabled && (
              <StyledSummaryCard
                header="Iron Bank"
                items={[
                  {
                    header: 'Supplied',
                    Component: <Amount value={ibSummary.supplyBalanceUsdc} input="usdc" />,
                  },
                  {
                    header: 'Borrow limit used',
                    Component: <Amount value={ibSummary.borrowUtilizationRatio} input="weipercent" />,
                  },
                ]}
                cardSize="small"
              />
            )}
          </Row>

          <StyledSummaryCard
            header="Vaults"
            items={[
              {
                header: 'Holdings',
                Component: <Amount value={vaultsSummary.totalDeposits} input="usdc" />,
              },
              {
                header: 'APY',
                Component: <Amount value={vaultsSummary.apy} input="percent" />,
              },
            ]}
            cardSize="small"
          />

          {currentNetworkSettings.labsEnabled && (
            <StyledSummaryCard
              header="Labs"
              items={[
                {
                  header: 'Holdings',
                  Component: <Amount value={labsSummary.totalDeposits} input="usdc" />,
                },
              ]}
              cardSize="small"
            />
          )}
        </>
      )}

      {!walletIsConnected && <StyledNoWalletCard />}
    </StyledViewContainer>
  );
};
