import { Card } from '@yearn-finance/web-lib';

import { useAppSelector } from '@hooks';
import { VotingEscrowsSelectors } from '@store';
import { Box } from '@components/common';
import { ViewContainer, SummaryCard, Amount } from '@components/app';
import { LockTab, ExtendLockTab, EarlyExitTab, ClaimUnlockedTab } from '@containers';
import { humanize } from '@utils';

export const VotingEscrowPage = () => {
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);

  return (
    <ViewContainer>
      <SummaryCard
        header="Overview"
        items={[
          {
            header: 'Total Locked YFI',
            Component: (
              <Amount value={humanize('amount', votingEscrow?.balance, votingEscrow?.token.decimals, 4)} decimals={8} />
            ),
          },
          {
            header: 'Your Locked YFI',
            Component: (
              <Amount
                value={humanize('amount', votingEscrow?.DEPOSIT.userDeposited, votingEscrow?.token.decimals, 4)}
                decimals={8}
              />
            ),
          },
          {
            header: 'Expiration for the lock',
            Component: <div>{votingEscrow?.unlockDate?.toLocaleDateString() ?? '-'}</div>,
          },
        ]}
        cardSize="small"
      />

      <Box width={1}>
        <Card.Tabs
          tabs={[
            { label: 'Lock YFI', children: <LockTab /> },
            { label: 'Extend lock', children: <ExtendLockTab /> },
            { label: 'Early exit', children: <EarlyExitTab /> },
            { label: 'Claim YFI', children: <ClaimUnlockedTab /> },
            // { label: 'Claim rewards', children: <ClaimRewardsTab /> },
            // { label: 'Stake / Unstake', children: <GaugesTab /> },
            // { label: 'Vote for gauge', children: <p>{'Vote'}</p> },
          ]}
        />
      </Box>
    </ViewContainer>
  );
};
