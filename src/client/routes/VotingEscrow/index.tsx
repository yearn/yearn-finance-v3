import { useState } from 'react';
import styled from 'styled-components';

import { useAppSelector } from '@hooks';
import { VotingEscrowsSelectors } from '@store';
import { Box, Text, Tabs, Tab, TabPanel } from '@components/common';
import { ViewContainer, Amount } from '@components/app';
import { LockTab, ManageLockTab, ClaimUnlockedTab, MintTab } from '@containers';
import { humanize } from '@utils';
import { getConfig } from '@config';

const TabsContainer = styled(Box)`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const StyledValue = styled(Text)`
  color: ${({ theme }) => theme.colors.titles};
  font-size: 3.2rem;
  line-height: 4rem;
  font-weight: bold;
`;

export const VotingEscrowPage = () => {
  const { ALLOW_DEV_MODE } = getConfig();
  const [selectedTab, setSelectedTab] = useState('lock');
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);

  const tabs = [
    { id: 'lock', label: 'Lock YFI', Component: <LockTab /> },
    { id: 'manage', label: 'Manage lock', Component: <ManageLockTab /> },
    // { id: 'exit', label: 'Early exit', Component: <EarlyExitTab /> },
    { id: 'claim', label: 'Claim', Component: <ClaimUnlockedTab /> },
    // { id: '', label: 'Claim rewards', Component: <ClaimRewardsTab /> },
    // { id: '', label: 'Stake / Unstake', Component: <GaugesTab /> },
    // { id: '', label: 'Vote for gauge', Component: <p>{'Vote'}</p> },
  ];

  if (ALLOW_DEV_MODE) tabs.push({ id: 'mint', label: 'Mint', Component: <MintTab /> });

  return (
    <ViewContainer>
      <Box center width={1} mt="8.8rem">
        <Text heading="h1" fontSize="8.8rem" lineHeight="10.8rem">
          veYFI
        </Text>
      </Box>

      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-around"
        alignItems="center"
        flexWrap="wrap"
        width={1}
        gap="5.6rem"
        mt="5.6rem"
        mb="5.6rem"
      >
        <Box center>
          <StyledValue>
            <Amount value={humanize('amount', votingEscrow?.balance, votingEscrow?.token.decimals, 4)} decimals={8} />
          </StyledValue>
          <Text fontSize="1.2rem" lineHeight="1.6rem" mt=".8rem">
            Total Locked YFI
          </Text>
        </Box>
        <Box center>
          <StyledValue>
            <Amount
              value={humanize('amount', votingEscrow?.DEPOSIT.userDeposited, votingEscrow?.token.decimals, 4)}
              decimals={8}
            />
          </StyledValue>
          <Text fontSize="1.2rem" lineHeight="1.6rem" mt=".8rem">
            Your Locked YFI
          </Text>
        </Box>
        <Box center>
          <StyledValue>
            <div>{votingEscrow?.unlockDate?.toLocaleDateString() ?? '-'}</div>
          </StyledValue>
          <Text fontSize="1.2rem" lineHeight="1.6rem" mt=".8rem">
            Expiration for the lock
          </Text>
        </Box>
      </Box>

      <TabsContainer>
        <Tabs value={selectedTab} onChange={(id) => setSelectedTab(id)}>
          {tabs.map(({ id, label }) => (
            <Tab value={id}>{label}</Tab>
          ))}
        </Tabs>
        {tabs.map(({ id, Component }) => (
          <TabPanel value={id} tabValue={selectedTab}>
            {Component}
          </TabPanel>
        ))}
      </TabsContainer>
    </ViewContainer>
  );
};
