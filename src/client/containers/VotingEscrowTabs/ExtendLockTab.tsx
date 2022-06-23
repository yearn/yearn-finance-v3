import { useState, useEffect } from 'react';

import { useAppSelector, useDebounce, useExecuteThunk } from '@hooks';
import { VotingEscrowsActions, VotingEscrowsSelectors, WalletSelectors } from '@store';
import { AmountInput } from '@components/app';
import { Box, Text, Button } from '@components/common';
import { toBN, toUnit, validateAmount, weeksBetween } from '@utils';

const MAX_LOCK_TIME = '208'; // Weeks

export const ExtendLockTab = () => {
  const [lockTime, setLockTime] = useState('');
  const [debouncedLockTime, isDebounceLockTimePending] = useDebounce(lockTime, 500);
  const [extendLockTime, extendLockTimeStatus] = useExecuteThunk(VotingEscrowsActions.extendLockTime);
  const [getExpectedTransactionOutcome, getExpectedTransactionOutcomeStatus, transactionOutcome] = useExecuteThunk(
    VotingEscrowsActions.getExpectedTransactionOutcome
  );
  const isWalletConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);

  const weeksToUnlock = votingEscrow?.unlockDate ? weeksBetween(new Date(), votingEscrow.unlockDate).toString() : '0';
  const resultAmount =
    transactionOutcome && votingEscrow ? toUnit(transactionOutcome.targetTokenAmount, votingEscrow.decimals) : '';

  useEffect(() => {
    if (!votingEscrow || toBN(debouncedLockTime).lte(0) || inputError) return;
    getExpectedTransactionOutcome({
      transactionType: 'EXTEND',
      tokenAddress: votingEscrow.token.address,
      votingEscrowAddress: votingEscrow.address,
      time: toBN(debouncedLockTime).toNumber(),
    });
  }, [debouncedLockTime]);

  const { approved: isValidLockTime, error: lockTimeError } = validateAmount({
    amount: votingEscrow ? lockTime : '1',
    maxAmountAllowed: MAX_LOCK_TIME,
  });

  const inputError = lockTimeError;

  const executeExtendLockTime = () => {
    if (!votingEscrow) return;
    extendLockTime({
      tokenAddress: votingEscrow.token.address,
      votingEscrowAddress: votingEscrow.address,
      time: parseInt(lockTime),
    });
  };

  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))">
      <Box>
        <Text heading="h2">Extend lock</Text>
        <Text>Description goes here</Text>
      </Box>
      <Box>
        <Box mt="0.8rem">
          <Box display="flex" gap="1.6rem">
            <AmountInput label="Current time" amount={weeksToUnlock} mt="1.6rem" width={1 / 2} disabled />
            <AmountInput
              label="Increase lock time (weeks)"
              amount={lockTime}
              onAmountChange={setLockTime}
              maxAmount={toBN(MAX_LOCK_TIME).minus(weeksToUnlock).toString()}
              message="min 1"
              mt="1.6rem"
              width={1 / 2}
            />
          </Box>
          <Box display="flex" alignItems="center" gap="1.6rem">
            <AmountInput label="Total veYFI" amount={resultAmount} mt="1.6rem" width={1 / 2} disabled />
            <Button
              onClick={executeExtendLockTime}
              disabled={!isValidLockTime || isDebounceLockTimePending}
              filled
              width={1 / 2}
              height="5.6rem"
              mt="4rem"
            >
              Extend
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
