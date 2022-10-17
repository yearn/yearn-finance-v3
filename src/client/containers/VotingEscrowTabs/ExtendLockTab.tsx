import { useState, useEffect } from 'react';

import { useAppSelector, useDebounce, useExecuteThunk, useIsMounting } from '@hooks';
import { VotingEscrowsActions, VotingEscrowsSelectors, WalletSelectors } from '@store';
import { AmountInput } from '@components/app';
import { Box, Text, Button } from '@components/common';
import { toBN, toUnit, validateAmount, getTimeUntil, toWeeks } from '@utils';

const MAX_LOCK_TIME = '209'; // Weeks

export const ExtendLockTab = () => {
  const isMounting = useIsMounting();
  const [lockTime, setLockTime] = useState('');
  const [debouncedLockTime, isDebounceLockTimePending] = useDebounce(lockTime, 500);
  const [extendLockTime, extendLockTimeStatus] = useExecuteThunk(VotingEscrowsActions.extendLockTime);
  const [getExpectedTransactionOutcome, getExpectedTransactionOutcomeStatus, transactionOutcome] = useExecuteThunk(
    VotingEscrowsActions.getExpectedTransactionOutcome
  );
  const isWalletConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);

  const willExtendLock = toBN(debouncedLockTime).gt(0);
  const weeksToUnlock = votingEscrow?.unlockDate
    ? toWeeks(getTimeUntil(votingEscrow.unlockDate.getTime())).toString()
    : '0';
  const resultAmount =
    !willExtendLock && votingEscrow
      ? toUnit(votingEscrow?.DEPOSIT.userBalance, votingEscrow.decimals)
      : willExtendLock && transactionOutcome && votingEscrow && !getExpectedTransactionOutcomeStatus.loading
      ? toUnit(transactionOutcome.targetTokenAmount, votingEscrow.decimals)
      : '';

  useEffect(() => {
    if (!votingEscrow || toBN(debouncedLockTime).lte(0) || inputError) return;
    getExpectedTransactionOutcome({
      transactionType: 'EXTEND',
      tokenAddress: votingEscrow.token.address,
      votingEscrowAddress: votingEscrow.address,
      time: toBN(debouncedLockTime).plus(weeksToUnlock).toNumber(),
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
      time: toBN(lockTime).plus(weeksToUnlock).toNumber(),
    });
  };

  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" minHeight="35rem">
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
              disabled={
                isMounting ||
                !isValidLockTime ||
                isDebounceLockTimePending ||
                getExpectedTransactionOutcomeStatus.loading ||
                !getExpectedTransactionOutcomeStatus.executed
              }
              filled
              width={1 / 2}
              height="5.6rem"
              mt="4.4rem"
            >
              Extend
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
