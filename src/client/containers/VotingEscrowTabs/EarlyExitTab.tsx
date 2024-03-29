import { useAppSelector, useExecuteThunk } from '@hooks';
import { AlertsActions, VotingEscrowsActions, VotingEscrowsSelectors } from '@store';
import { AmountInput } from '@components/app';
import { Box, Text, Button } from '@components/common';
import { humanize, toBN, getTimeUntil, toWeeks, format } from '@utils';

export const EarlyExitTab = () => {
  const [openAlert] = useExecuteThunk(AlertsActions.openAlert);
  const displayWarning = (error: any) => openAlert({ message: error.message, type: 'warning' });
  const [withdrawLocked, withdrawLockedStatus] = useExecuteThunk(VotingEscrowsActions.withdrawLocked, displayWarning);
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);

  const hasLockedAmount =
    toBN(votingEscrow?.earlyExitPenaltyRatio).gt(0) && toBN(votingEscrow?.DEPOSIT.userDeposited).gt(0);
  const weeksToUnlock = votingEscrow?.unlockDate
    ? toWeeks(getTimeUntil(votingEscrow.unlockDate.getTime())).toString()
    : '0';
  const expectedTokens = hasLockedAmount
    ? toBN(votingEscrow?.DEPOSIT.userDeposited)
        .times(toBN(1).minus(votingEscrow?.earlyExitPenaltyRatio ?? 0))
        .toString()
    : '0';

  const executeWithdrawLocked = async () => {
    if (!votingEscrow) return;
    withdrawLocked({
      tokenAddress: votingEscrow.token.address,
      votingEscrowAddress: votingEscrow.address,
    });
  };

  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
      minHeight="35rem"
      p={['2rem', '3.2rem']}
      width={1}
    >
      <Box>
        <Text heading="h2">Early exit</Text>
        <Text>Description goes here</Text>
      </Box>
      <Box>
        <Box mt="0.8rem">
          <Box display="flex" flexDirection={['column', 'column', 'row']} gap="2.4rem">
            <AmountInput
              label="veYFI you have"
              amount={humanize('amount', votingEscrow?.DEPOSIT.userBalance, votingEscrow?.decimals)}
              mt="1.6rem"
              width={[1, 1, 1 / 2]}
              disabled
            />
            <AmountInput
              label="Current lock time (weeks)"
              amount={weeksToUnlock}
              mt={['0rem', '0rem', '1.6rem']}
              width={[1, 1, 1 / 2]}
              disabled
            />
          </Box>
          <Box display="flex" flexDirection={['column', 'column', 'row']} alignItems="center" gap="2.4rem">
            <AmountInput
              label="YFI you get"
              amount={humanize('amount', expectedTokens, votingEscrow?.token.decimals)}
              message={`Penalty: ${format('percent', votingEscrow?.earlyExitPenaltyRatio?.toString(), 2)}`}
              mt="1.6rem"
              width={[1, 1, 1 / 2]}
              disabled
            />
            <Button
              onClick={executeWithdrawLocked}
              isLoading={withdrawLockedStatus.loading}
              success={withdrawLockedStatus.executed && !withdrawLockedStatus.error}
              disabled={!hasLockedAmount || withdrawLockedStatus.loading}
              filled
              rounded={false}
              width={[1, 1, 1 / 2]}
              height="4rem"
              mt={['0rem', '0rem', '2.4rem']}
            >
              Exit
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
