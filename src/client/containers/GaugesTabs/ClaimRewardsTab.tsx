import { useState } from 'react';
import { keyBy } from 'lodash';

import { useAppSelector, useExecuteThunk } from '@hooks';
import { GaugesActions, GaugesSelectors, VotingEscrowsSelectors, WalletSelectors } from '@store';
import { AmountInput } from '@components/app';
import { Box, Text, Button, Dropdown } from '@components/common';
import { humanize } from '@utils';

export const ClaimRewardsTab = () => {
  const [selectedGaugeAddress, setSelectedGaugeAddress] = useState('');
  const [claimAllRewards, claimAllRewardsStatus] = useExecuteThunk(GaugesActions.claimAllRewards);
  const [claimRewards, claimRewardsStatus] = useExecuteThunk(GaugesActions.claimRewards);
  const isWalletConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);
  const gaugesWithRewards = useAppSelector(GaugesSelectors.selectGaugesWithRewards);
  const { totalRewards, totalRewardsUsdc } = useAppSelector(GaugesSelectors.selectSummaryData);
  const gaugesWithRewardsMap = keyBy(gaugesWithRewards, 'address');
  const selectedGauge = gaugesWithRewardsMap[selectedGaugeAddress];

  // const gaugeOptions = gaugesWithRewards.map(({ address, name, token }) => ({
  //   key: address,
  //   value: name,
  //   icon: token.icon,
  // }));

  // TODO: Remove when data available
  const gaugeOptions = [
    {
      key: '0x1',
      value: 'yvDAI',
      icon: 'https://raw.githack.com/yearn/yearn-assets/master/icons/multichain-tokens/1/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/logo-128.png',
    },
    {
      key: '0x2',
      value: 'yvWBTC',
      icon: 'https://raw.githack.com/yearn/yearn-assets/master/icons/multichain-tokens/1/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/logo-128.png',
    },
    {
      key: '0x3',
      value: 'yvUSDC',
      icon: 'https://raw.githack.com/yearn/yearn-assets/master/icons/multichain-tokens/1/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/logo-128.png',
    },
    {
      key: '0x4',
      value: 'yvYFI',
      icon: 'https://raw.githack.com/yearn/yearn-assets/master/icons/multichain-tokens/1/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/logo-128.png',
    },
    {
      key: '0x5',
      value: 'yvWETH',
      icon: 'https://raw.githack.com/yearn/yearn-assets/master/icons/multichain-tokens/1/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/logo-128.png',
    },
  ];

  const executeClaimAllRewards = async () => {
    if (!votingEscrow) return;
    claimAllRewards({
      tokenAddress: votingEscrow.token.address,
    });
  };

  const executeClaimRewards = async () => {
    if (!votingEscrow || !selectedGaugeAddress) return;
    claimRewards({
      tokenAddress: votingEscrow.token.address,
      gaugeAddress: selectedGaugeAddress,
    });
  };

  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))">
      <Box>
        <Text heading="h2">Claim rewards</Text>
        <Text>Description goes here</Text>
      </Box>
      <Box>
        <Box mt="0.8rem">
          <Text heading="h3">Claim</Text>
          <Box display="flex" alignItems="center" gap="1.6rem">
            <AmountInput
              label="All unclaimed YFI"
              amount={humanize('amount', totalRewards, votingEscrow?.token.decimals, 4)}
              message={`= ${humanize('usd', totalRewardsUsdc, votingEscrow?.token.decimals)}`}
              mt="1.6rem"
              width={1 / 2}
              disabled
            />
            <Button onClick={executeClaimAllRewards} filled width={1 / 2} height="5.6rem" mt="2.4rem">
              Claim all
            </Button>
          </Box>
          <Box display="flex" alignItems="center" gap="2.4rem">
            <Box display="flex" alignItems="center" mt="2.4rem" width={1 / 2}>
              <Dropdown
                selected={{
                  key: selectedGaugeAddress,
                  value: selectedGauge?.name ?? '',
                }}
                onChange={({ key }) => setSelectedGaugeAddress(key)}
                items={gaugeOptions}
                fullWidth
              />
            </Box>
            <AmountInput
              label="Unclaimed YFI"
              amount={humanize('amount', selectedGauge?.YIELD.userDeposited, votingEscrow?.token.decimals, 4)}
              message={`= ${humanize('usd', selectedGauge?.YIELD.userDepositedUsdc, votingEscrow?.token.decimals)}`}
              mt="1.6rem"
              width={1 / 2}
              disabled
            />
          </Box>
          <Box display="flex" alignItems="center" justifyContent="end" gap="2.4rem">
            <Box width={1 / 2}></Box>
            <Button
              onClick={executeClaimRewards}
              disabled={!selectedGaugeAddress}
              filled
              width={1 / 2}
              height="5.6rem"
              mt="2.4rem"
            >
              Claim
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
