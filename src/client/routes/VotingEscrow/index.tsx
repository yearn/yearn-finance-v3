import { useState } from 'react';
import styled from 'styled-components';

import { useAppSelector } from '@hooks';
import { VotingEscrowsSelectors } from '@store';
import { Box, Text, Tabs, Tab, TabPanel, AnimatePresence, motion } from '@components/common';
import { ViewContainer, Amount } from '@components/app';
import { LockTab, ManageLockTab, ClaimUnlockedTab, MintTab } from '@containers';
import { humanize } from '@utils';
import { getConfig } from '@config';

const variants = {
  initial: { y: 10, opacity: 0 },
  enter: { y: 0, opacity: 1 },
  exit: { y: -10, opacity: 0 },
};

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
    <motion.div initial={'initial'} animate={'enter'} transition={{ duration: 1 }} variants={variants}>
      <ViewContainer noGap noOverflow>
        <Box center width={1} mt="8.8rem">
          <Text heading="h1" fontSize="8.8rem" lineHeight="10.4rem" m={0}>
            veYFI
          </Text>
        </Box>

        <Box
          display="flex"
          flexDirection="row"
          justifyContent="center"
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
              <Text fontFamily="Aeonik Mono">
                {votingEscrow?.unlockDate?.toLocaleDateString().replaceAll('/', '.') ?? '-'}
              </Text>
            </StyledValue>
            <Text fontSize="1.2rem" lineHeight="1.6rem" mt=".8rem">
              Expiration for the lock
            </Text>
          </Box>
        </Box>

        <TabsContainer>
          <Tabs value={selectedTab} onChange={(id) => setSelectedTab(id)}>
            {tabs.map(({ id, label }) => (
              <Tab key={`tab-label-${id}`} value={id}>
                {label}
              </Tab>
            ))}
          </Tabs>
          <AnimatePresence exitBeforeEnter>
            <motion.div
              key={selectedTab}
              initial={'initial'}
              animate={'enter'}
              exit={'exit'}
              variants={variants}
              transition={{ duration: 0.15 }}
            >
              {tabs.map(({ id, Component }) => (
                <TabPanel key={`tab-panel-${id}`} value={id} tabValue={selectedTab}>
                  {Component}
                </TabPanel>
              ))}
            </motion.div>
          </AnimatePresence>
        </TabsContainer>
      </ViewContainer>
    </motion.div>
  );
};
