import { useState, useEffect } from 'react';

import { useAppSelector, useAppTranslation, useDebounce, useExecuteThunk, useIsMounting } from '@hooks';
import { AlertsActions, VotingEscrowsActions, VotingEscrowsSelectors } from '@store';
import { AmountInput } from '@components/app';
import { Box, Text, Button } from '@components/common';
import { toBN, toUnit, validateAmount, getTimeUntil, toWeeks, humanize, format } from '@utils';

const MAX_LOCK_TIME = '209'; // Weeks
const MIN_LOCK_TIME = '2'; // Weeks

export const ManageLockTab = () => {
  const { t } = useAppTranslation(['common', 'veyfi']);
  const isMounting = useIsMounting();
  const [lockTime, setLockTime] = useState('');
  const [debouncedLockTime, isDebounceLockTimePending] = useDebounce(lockTime, 500);
  const [openAlert] = useExecuteThunk(AlertsActions.openAlert);
  const displayWarning = (error: any) => openAlert({ message: error.message, type: 'warning' });
  const [extendLockTime, extendLockTimeStatus] = useExecuteThunk(VotingEscrowsActions.extendLockTime, displayWarning);
  const [withdrawLocked, withdrawLockedStatus] = useExecuteThunk(VotingEscrowsActions.withdrawLocked, displayWarning);
  const [getExpectedTransactionOutcome, getExpectedTransactionOutcomeStatus, transactionOutcome] = useExecuteThunk(
    VotingEscrowsActions.getExpectedTransactionOutcome,
    displayWarning
  );
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);

  const willExtendLock = toBN(debouncedLockTime).gt(0);
  const weeksToUnlock = votingEscrow?.unlockDate
    ? toWeeks(getTimeUntil(votingEscrow.unlockDate.getTime())).toString()
    : '0';
  const extendResultAmount =
    !willExtendLock && votingEscrow
      ? toUnit(votingEscrow?.DEPOSIT.userBalance, votingEscrow.decimals)
      : willExtendLock && transactionOutcome && votingEscrow && !getExpectedTransactionOutcomeStatus.loading
      ? toUnit(transactionOutcome.targetTokenAmount, votingEscrow.decimals)
      : '';

  const hasDeposits = toBN(votingEscrow?.DEPOSIT.userDeposited).gt(0);
  const hasLockedAmount = toBN(votingEscrow?.earlyExitPenaltyRatio).gt(0) && hasDeposits;
  const exitResultAmount = hasLockedAmount
    ? toBN(votingEscrow?.DEPOSIT.userDeposited)
        .times(toBN(1).minus(votingEscrow?.earlyExitPenaltyRatio ?? 0))
        .toString()
    : '0';

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
    minAmountAllowed: MIN_LOCK_TIME,
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
      gap="6.4rem"
      minHeight="35rem"
      p={['2rem', '3.2rem']}
      width={1}
    >
      <Box overflow="hidden">
        <Box minHeight="9.28rem">
          <Text heading="h2" m={0}>
            {t('veyfi:manage-tab.extend-section.header')}
          </Text>
          <Text mt="2.4rem">{t('veyfi:manage-tab.extend-section.desc-1')}</Text>
        </Box>

        <Box display="flex" flexDirection={['column', 'column', 'row']} gap="2.4rem" mt="2.4rem">
          <AmountInput
            label={t('veyfi:manage-tab.lock-period')}
            amount={weeksToUnlock}
            width={[1, 1, 1 / 2]}
            disabled
          />
          <AmountInput
            label={t('veyfi:manage-tab.increase-period')}
            amount={lockTime}
            onAmountChange={setLockTime}
            maxAmount={toBN(MAX_LOCK_TIME).minus(weeksToUnlock).toString()}
            disabled={!hasDeposits}
            message="min 1"
            width={[1, 1, 1 / 2]}
          />
        </Box>
        <Box display="flex" flexDirection={['column', 'column', 'row']} alignItems="center" gap="2.4rem" mt="1.2rem">
          <AmountInput
            label={t('veyfi:manage-tab.total')}
            amount={extendResultAmount}
            loading={getExpectedTransactionOutcomeStatus.loading}
            width={[1, 1, 1 / 2]}
            disabled
          />
          <Button
            onClick={executeExtendLockTime}
            isLoading={extendLockTimeStatus.loading}
            success={extendLockTimeStatus.executed && !extendLockTimeStatus.error}
            disabled={
              isMounting ||
              !isValidLockTime ||
              isDebounceLockTimePending ||
              getExpectedTransactionOutcomeStatus.loading ||
              !getExpectedTransactionOutcomeStatus.executed ||
              extendLockTimeStatus.loading
            }
            filled
            rounded={false}
            width={[1, 1, 1 / 2]}
            height="4rem"
            mt={['0rem', '0rem', '2rem']}
          >
            Extend
          </Button>
        </Box>
      </Box>
      <Box mt={['-3.2rem', '0rem']}>
        <Box minHeight="9.28rem">
          <Text heading="h2" m={0}>
            {t('veyfi:manage-tab.exit-section.header')}
          </Text>
          <Text mt="2.4rem">{t('veyfi:manage-tab.exit-section.desc-1')}</Text>
        </Box>
        <Box mt="2.4rem">
          <Box mt="0.8rem">
            <Box display="flex" flexDirection={['column', 'column', 'row']} gap="2.4rem">
              <AmountInput
                label={t('veyfi:manage-tab.balance')}
                amount={humanize('amount', votingEscrow?.DEPOSIT.userBalance, votingEscrow?.decimals)}
                width={[1, 1, 1 / 2]}
                disabled
              />
              <AmountInput
                label={t('veyfi:manage-tab.lock-time')}
                amount={weeksToUnlock}
                width={[1, 1, 1 / 2]}
                disabled
              />
            </Box>
            <Box
              display="flex"
              flexDirection={['column', 'column', 'row']}
              alignItems="center"
              gap="2.4rem"
              mt="3.2rem"
            >
              <AmountInput
                label={t('veyfi:manage-tab.expected')}
                amount={humanize('amount', exitResultAmount, votingEscrow?.token.decimals)}
                message={`Penalty: ${format('percent', votingEscrow?.earlyExitPenaltyRatio?.toString(), 2)}`}
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
              >
                Exit
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
