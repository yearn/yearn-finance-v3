import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { ViewContainer } from '@components/app';
import { DepositTx, WithdrawTx } from '@components/app/Transactions';

import { Card, CardHeader, Tab, TabPanel, Tabs } from '@components/common';
import { LineChart } from '@components/common/Charts';
import { VaultsActions } from '@store';
import { useAppDispatch } from '@hooks';

const StyledLineChart = styled(LineChart)`
  margin-top: 2.4rem;
`;

const VaultChart = styled(Card)`
  flex: 1 100%;
  width: 100%;
`;

const StyledCardHeader = styled(CardHeader)`
  padding: 0;
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
`;

const VaultOverview = styled(Card)`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-self: stretch;
`;
const VaultDetailView = styled(ViewContainer)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

export interface VaultDetailRouteParams {
  vaultAddress: string;
}

export const VaultDetail = () => {
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const { vaultAddress } = useParams<VaultDetailRouteParams>();
  const [selectedTab, setSelectedTab] = React.useState('deposit');

  useEffect(() => {
    dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress }));
  }, []);

  const handleTabChange = (newValue: string) => {
    setSelectedTab(newValue);
  };

  const data = [
    {
      id: 'japan',
      // color: '#d9269a',
      data: [
        { x: '2019-05-01', y: 2 },
        { x: '2019-06-01', y: 7 },
        { x: '2019-09-01', y: 1 },
      ],
    },
  ];

  return (
    <VaultDetailView>
      <VaultOverview>
        <StyledCardHeader header="Overview" />
        <h3>Vault: {vaultAddress}</h3>
      </VaultOverview>

      <VaultActions>
        <StyledCardHeader header="Transactions" />

        <ActionsTabs value={selectedTab} onChange={handleTabChange}>
          <Tab value="deposit">Deposit</Tab>
          <Tab value="withdraw">Withdraw</Tab>
        </ActionsTabs>

        <StyledTabPanel value="deposit" tabValue={selectedTab}>
          <DepositTx />
        </StyledTabPanel>
        <StyledTabPanel value="withdraw" tabValue={selectedTab}>
          <WithdrawTx />
        </StyledTabPanel>
      </VaultActions>

      <VaultChart>
        <StyledCardHeader header="Performance" />
        <StyledLineChart chartData={data} tooltipLabel="Earning Over Time" />
      </VaultChart>
    </VaultDetailView>
  );
};
