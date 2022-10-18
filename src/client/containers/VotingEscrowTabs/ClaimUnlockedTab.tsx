import { useAppSelector, useExecuteThunk } from '@hooks';
import { VotingEscrowsActions, VotingEscrowsSelectors, WalletSelectors } from '@store';
import { AmountInput, TxError } from '@components/app';
import { Box, Text, Button } from '@components/common';
import { humanize, toBN, validateNetwork } from '@utils';
import { getConfig } from '@config';

export const ClaimUnlockedTab = () => {
  const { NETWORK } = getConfig();
  const [withdrawUnlocked, withdrawUnlockedStatus] = useExecuteThunk(VotingEscrowsActions.withdrawUnlocked);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);

  const hasLockedAmount = !!votingEscrow?.earlyExitPenaltyRatio && toBN(votingEscrow?.DEPOSIT.userDeposited).gt(0);
  const unlockedAmount = !votingEscrow?.unlockDate ? votingEscrow?.DEPOSIT.userBalance : '0';

  const { error: networkError } = validateNetwork({
    currentNetwork: NETWORK,
    walletNetwork,
  });

  const error = networkError || withdrawUnlockedStatus.error;

  const executeWithdrawUnlocked = async () => {
    if (!votingEscrow) return;
    withdrawUnlocked({
      tokenAddress: votingEscrow.token.address,
      votingEscrowAddress: votingEscrow.address,
    });
  };

  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" minHeight="35rem">
      <Box>
        <Text heading="h2">Claim YFI (expired lock)</Text>
        <Text>Description goes here</Text>
      </Box>
      <Box>
        <Box mt="0.8rem">
          <Text heading="h3">Claiming</Text>
          <Box display="flex" alignItems="center" gap="1.6rem">
            <AmountInput
              label="Unlocked YFI"
              amount={humanize('amount', unlockedAmount, votingEscrow?.decimals)}
              mt="1.6rem"
              width={1 / 2}
              disabled
            />
            <Button
              onClick={executeWithdrawUnlocked}
              isLoading={withdrawUnlockedStatus.loading}
              success={withdrawUnlockedStatus.executed && !withdrawUnlockedStatus.error}
              disabled={hasLockedAmount || withdrawUnlockedStatus.loading}
              filled
              width={1 / 2}
              height="5.6rem"
              mt="4.4rem"
            >
              Claim
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
