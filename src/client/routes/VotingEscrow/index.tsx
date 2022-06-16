// import styled from 'styled-components';
import { Card } from '@yearn-finance/web-lib';

import { Box } from '@components/common';
import { ViewContainer, SummaryCard, Amount } from '@components/app';
import { LockTab, ExtendLockTab, EarlyExitTab, ClaimUnlockedTab } from '@containers';

export const VotingEscrowPage = () => {
  return (
    <ViewContainer>
      <SummaryCard
        header="Overview"
        items={[
          { header: 'Total Locked YFI', Component: <Amount value="0" decimals={8} /> },
          { header: 'Your Locked YFI', Component: <Amount value="0" decimals={8} /> },
          { header: 'Expiration for the lock', Component: <Amount value="0" showDecimals={false} /> },
          { header: 'Current weeks', Component: <Amount value="0" showDecimals={false} /> },
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
            // { label: 'Claim rewards', children: <p>{'ClaimRewards'}</p> },
            // { label: 'Stake / Unstake', children: <p>{'Stake'}</p> },
            // { label: 'Vote for gauge', children: <p>{'Vote'}</p> },
          ]}
        />
      </Box>
    </ViewContainer>
  );
};
