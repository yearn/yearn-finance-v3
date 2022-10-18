import { useAppSelector, useExecuteThunk } from '@hooks';
import { VotingEscrowsActions, VotingEscrowsSelectors, WalletSelectors } from '@store';
import { AmountInput, TxError } from '@components/app';
import { Box, Text, Button } from '@components/common';
import { humanize, toBN, getTimeUntil, toWeeks, format, validateNetwork } from '@utils';
import { getConfig } from '@config';

export const EarlyExitTab = () => {
  const { NETWORK } = getConfig();
  const [withdrawLocked, withdrawLockedStatus] = useExecuteThunk(VotingEscrowsActions.withdrawLocked);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
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

  const { error: networkError } = validateNetwork({
    currentNetwork: NETWORK,
    walletNetwork,
  });

  const error = networkError || withdrawLockedStatus.error;

  const executeWithdrawLocked = async () => {
    if (!votingEscrow) return;
    withdrawLocked({
      tokenAddress: votingEscrow.token.address,
      votingEscrowAddress: votingEscrow.address,
    });
  };

  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" minHeight="35rem">
      <Box>
        <Text heading="h2">Early exit</Text>
        <Text>Description goes here</Text>
      </Box>
      <Box>
        <Box mt="0.8rem">
          <Box display="flex" gap="1.6rem">
            <AmountInput
              label="veYFI you have"
              amount={humanize('amount', votingEscrow?.DEPOSIT.userBalance, votingEscrow?.decimals)}
              mt="1.6rem"
              width={1 / 2}
              disabled
            />
            <AmountInput label="Current lock time (weeks)" amount={weeksToUnlock} mt="1.6rem" width={1 / 2} disabled />
          </Box>
          <Box display="flex" alignItems="center" gap="1.6rem">
            <AmountInput
              label="YFI you get"
              amount={humanize('amount', expectedTokens, votingEscrow?.token.decimals)}
              message={`Penalty: ${format('percent', votingEscrow?.earlyExitPenaltyRatio?.toString(), 2)}`}
              mt="1.6rem"
              width={1 / 2}
              disabled
            />
            <Button
              onClick={executeWithdrawLocked}
              isLoading={withdrawLockedStatus.loading}
              success={withdrawLockedStatus.executed && !withdrawLockedStatus.error}
              disabled={!hasLockedAmount || withdrawLockedStatus.loading}
              filled
              width={1 / 2}
              height="5.6rem"
              mt="2.4rem"
            >
              Exit
            </Button>
          </Box>
          {error && (
            <Box mt="1.6rem">
              <TxError errorType="warning" errorTitle={error} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
