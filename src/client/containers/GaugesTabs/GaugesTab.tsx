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
import { Box, Text } from '@components/common';
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
      <DetailCard
        header="Stake / Unstake"
        metadata={[
          {
            key: 'name',
            header: 'Asset',
          },
          {
            key: 'vaultApy',
            header: 'Vault APY',
          },
          {
            key: 'vaultDeposited',
            header: 'Deposited in Vault',
          },
          {
            key: 'gaugeApy',
            header: 'Gauge APY',
          },
          {
            key: 'boost',
            header: 'Boost',
          },
          {
            key: 'gaugeStaked',
            header: 'Staked in Gauge',
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
            align: 'flex-end',
            width: 'auto',
            grow: '1',
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
        ]}
      />
    </Box>
  );
};
