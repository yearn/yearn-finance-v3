import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@hooks';
import { LabsSelectors, TokensSelectors, VaultsSelectors, WalletSelectors } from '@store';
import {
  SummaryCard,
  DetailCard,
  RecommendationsCard,
  ActionButtons,
  TokenIcon,
  InfoCard,
  ViewContainer,
} from '@components/app';
import { formatPercent, humanizeAmount, normalizePercent, normalizeUsdc, USDC_DECIMALS } from '@src/utils';
import { Box, SpinnerLoading, SearchInput } from '@components/common';
import { getConstants } from '../../../config/constants';

const SearchBarContainer = styled.div`
  margin: 1.2rem;
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

export const Labs = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const { CRV, YVTHREECRV } = getConstants().CONTRACT_ADDRESSES;
  const history = useHistory();
  const dispatch = useAppDispatch();
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const { totalDeposits, totalEarnings, estYearlyYeild } = useAppSelector(LabsSelectors.selectSummaryData);
  const recommendations = useAppSelector(LabsSelectors.selectRecommendations);
  const holdings = useAppSelector(LabsSelectors.selectDepositedLabs);
  const opportunities = useAppSelector(LabsSelectors.selectLabsOpportunities);
  const [filteredOpportunities, setFilteredOpportunities] = useState(opportunities);

  const labsStatus = useAppSelector(LabsSelectors.selectLabsStatus);

  const tokenSelectorFilter = useAppSelector(TokensSelectors.selectToken);
  const crvToken = tokenSelectorFilter(CRV);
  const vaultSelectorFilter = useAppSelector(VaultsSelectors.selectVault);
  const yv3CrvVault = vaultSelectorFilter(YVTHREECRV);

  useEffect(() => {
    setFilteredOpportunities(opportunities);
  }, [opportunities]);

  const actionHandler = (labAddress: string) => {
    // dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
    history.push(`/vault/${labAddress}`);
  };

  return (
    <ViewContainer>
      <SummaryCard
        header="Dashboard"
        items={[
          { header: 'Holdings', content: `${normalizeUsdc(totalDeposits)}` },
          { header: 'Earnings', content: `${normalizeUsdc(totalEarnings)}` },
          { header: 'Est. Yearly Yield', content: `${normalizePercent(estYearlyYeild, 2)}` },
        ]}
        variant="secondary"
        cardSize="big"
      />

      {labsStatus.loading && (
        <Box height="100%" width="100%" position="relative" display="flex" center paddingTop="4rem">
          <SpinnerLoading flex="1" />
        </Box>
      )}

      {!labsStatus.loading && (
        <>
          <Row>
            <RecommendationsCard
              header="Recommendations"
              items={recommendations.map(({ address, name, apyData, icon }) => ({
                header: 'Special Token',
                icon: icon,
                name: name,
                info: formatPercent(apyData, 2),
                infoDetail: 'EYY',
                action: '>',
                onAction: () => history.push(`/vault/${address}`),
              }))}
            />

            <StyledInfoCard header="Onboarding" content="....." />
          </Row>

          <DetailCard
            header="Holdings"
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
              },
              { key: 'name', header: 'Name' },
              { key: 'apy', header: 'ROI' },
              { key: 'balance', header: 'Balance' },
              { key: 'value', header: 'Value' },
              {
                key: 'actions',
                transform: ({ labAddress }) => (
                  <ActionButtons actions={[{ name: '>', handler: () => actionHandler(labAddress) }]} />
                ),
                align: 'flex-end',
                grow: '1',
              },
            ]}
            data={holdings.map((lab) => ({
              icon: lab.icon,
              tokenSymbol: lab.name,
              name: lab.name,
              balance: humanizeAmount(lab.DEPOSIT.userBalance, parseInt(lab.decimals), 4),
              value: `$ ${humanizeAmount(lab.DEPOSIT.userDepositedUsdc, USDC_DECIMALS, 2)}`,
              apy: formatPercent(lab.apyData, 2),
              labAddress: lab.address,
            }))}
          />

          <DetailCard
            header="Opportunities"
            metadata={[
              {
                key: 'icon',
                transform: ({ icon, tokenSymbol }) => <TokenIcon icon={icon} symbol={tokenSymbol} />,
                width: '6rem',
              },
              { key: 'name', header: 'Name', fontWeight: 600 },
              { key: 'apy', header: 'APY' },
              { key: 'labBalanceUsdc', header: 'Total Assets' },
              { key: 'tokenBalanceUsdc', header: 'Available to Invest' },
              {
                key: 'actions',
                transform: ({ labAddress }) => (
                  <ActionButtons
                    actions={[{ name: '>', handler: () => actionHandler(labAddress), disabled: !walletIsConnected }]}
                  />
                ),
                align: 'flex-end',
                grow: '1',
              },
            ]}
            data={filteredOpportunities.map((lab) => ({
              icon: lab.icon,
              tokenSymbol: lab.name,
              name: lab.name,
              apy: formatPercent(lab.apyData, 2),
              labBalanceUsdc: `$ ${humanizeAmount(lab.labBalanceUsdc, USDC_DECIMALS, 0)}`,
              tokenBalanceUsdc: normalizeUsdc(lab.token.balanceUsdc),
              labAddress: lab.address,
            }))}
            SearchBar={
              <SearchBarContainer>
                <SearchInput
                  searchableData={opportunities}
                  searchableKeys={['name', 'token.symbol', 'token.name']}
                  placeholder="Search"
                  onSearch={(data) => setFilteredOpportunities(data)}
                />
              </SearchBarContainer>
            }
          />
        </>
      )}
    </ViewContainer>
  );
};
