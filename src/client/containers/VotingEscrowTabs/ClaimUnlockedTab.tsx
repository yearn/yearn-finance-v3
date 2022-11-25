import { useAppSelector, useExecuteThunk } from '@hooks';
import { AlertsActions, VotingEscrowsActions, VotingEscrowsSelectors } from '@store';
import { AmountInput } from '@components/app';
import { Box, Text, Button } from '@components/common';
import { humanize, toBN } from '@utils';

export const ClaimUnlockedTab = () => {
  const [openAlert] = useExecuteThunk(AlertsActions.openAlert);
  const displayWarning = (error: any) => openAlert({ message: error.message, type: 'warning' });
  const [withdrawUnlocked, withdrawUnlockedStatus] = useExecuteThunk(
    VotingEscrowsActions.withdrawUnlocked,
    displayWarning
  );
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);

  const unlockedAmount = !votingEscrow?.unlockDate ? votingEscrow?.DEPOSIT.userDeposited : '0';
  const hasUnlockedAmount = toBN(unlockedAmount).gt(0);

  const executeWithdrawUnlocked = async () => {
    if (!votingEscrow) return;
    withdrawUnlocked({
      tokenAddress: votingEscrow.token.address,
      votingEscrowAddress: votingEscrow.address,
    });
  };

  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
      minHeight="35rem"
      gap="6.4rem"
      p={['2rem', '3.2rem']}
      width={1}
    >
      <Box overflow="hidden">
        <Box>
          <Text heading="h2" m={0}>
            Claim expired lock
          </Text>
          <Text mt="2.4rem">Claim your YFI from expired veYFI lock.</Text>
        </Box>
      </Box>
      <Box mt={['-4rem', '5rem']}>
        <Box display="flex" flexDirection={['column', 'column', 'row']} alignItems="center" gap="2.4rem">
          <AmountInput
            label="Unlocked YFI"
            amount={humanize('amount', unlockedAmount, votingEscrow?.decimals)}
            width={[1, 1, 1 / 2]}
            disabled
          />
          <Button
            onClick={executeWithdrawUnlocked}
            isLoading={withdrawUnlockedStatus.loading}
            success={withdrawUnlockedStatus.executed && !withdrawUnlockedStatus.error}
            disabled={!hasUnlockedAmount || withdrawUnlockedStatus.loading}
            filled
            rounded={false}
            width={[1, 1, 1 / 2]}
            height="4rem"
            mt={['0rem', '0rem', '2.2rem']}
          >
            Claim
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
