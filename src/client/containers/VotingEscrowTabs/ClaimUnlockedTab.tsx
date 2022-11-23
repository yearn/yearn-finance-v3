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

  const unlockedAmount = !votingEscrow?.unlockDate ? votingEscrow?.DEPOSIT.userDeposited : '0';
  const hasUnlockedAmount = toBN(unlockedAmount).gt(0);

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
        {error && (
          <Box mt="3.2rem">
            <TxError errorType="warning" errorTitle={error} />
          </Box>
        )}
      </Box>
    </Box>
  );
};
