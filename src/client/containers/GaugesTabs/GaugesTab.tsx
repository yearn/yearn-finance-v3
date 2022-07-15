import { keyBy } from 'lodash';

import { useAppDispatch, useAppSelector } from '@hooks';
import {
  GaugesActions,
  GaugesSelectors,
  VotingEscrowsSelectors,
  VaultsSelectors,
  WalletSelectors,
  ModalsActions,
} from '@store';
import { DetailCard, ActionButtons } from '@components/app';
import { Box, Text, Table } from '@components/common';
import { humanize } from '@utils';

export const GaugesTab = () => {
  const dispatch = useAppDispatch();
  const isWalletConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);
  const gauges = useAppSelector(GaugesSelectors.selectGauges);
  const vaults = useAppSelector(VaultsSelectors.selectVaults);
  const gaugesMap = keyBy(gauges, 'address');
  const vaultsMap = keyBy(vaults, 'address');

  const stakeHandler = (gaugeAddress: string) => {
    dispatch(GaugesActions.setSelectedGaugeAddress({ gaugeAddress }));
    dispatch(ModalsActions.openModal({ modalName: 'gaugeStakeTx' }));
  };

  const unstakeHandler = (gaugeAddress: string) => {
    dispatch(GaugesActions.setSelectedGaugeAddress({ gaugeAddress }));
    dispatch(ModalsActions.openModal({ modalName: 'gaugeUnstakeTx' }));
  };

  return (
    <Box minHeight="35rem">
      <Table
        header="Stake / Unstake"
        metadata={[
          {
            key: 'name',
            header: 'Asset',
            sortable: true,
          },
          {
            key: 'vaultApy',
            header: 'Vault APY',
            sortable: true,
          },
          {
            key: 'vaultDeposited',
            header: 'Deposited in Vault',
            sortable: true,
          },
          {
            key: 'gaugeApy',
            header: 'Gauge APY',
            sortable: true,
          },
          {
            key: 'boost',
            header: 'Boost',
            sortable: true,
          },
          {
            key: 'gaugeStaked',
            header: 'Staked in Gauge',
            sortable: true,
          },
          {
            key: 'actions',
            transform: ({ address }) => (
              <ActionButtons
                actions={[
                  { name: 'Unstake', handler: () => unstakeHandler(address) },
                  { name: 'Stake', handler: () => stakeHandler(address) },
                ]}
              />
            ),
          },
        ]}
        data={[
          {
            address: '0x00...',
            name: 'yvWBTC',
            vaultApy: '42%',
            vaultDeposited: '0',
            gaugeApy: '42%',
            boost: 'x1',
            gaugeStaked: '0',
            actions: null,
          },
          {
            address: '0x01...',
            name: 'yvDAI',
            vaultApy: '42%',
            vaultDeposited: '0',
            gaugeApy: '42%',
            boost: 'x10',
            gaugeStaked: '0',
            actions: null,
          },
        ]}
        initialSortBy="gaugeApy"
      />
    </Box>
  );
};
