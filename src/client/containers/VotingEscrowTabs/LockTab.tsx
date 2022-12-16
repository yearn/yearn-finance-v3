import { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppTranslation, useDebounce, useExecuteThunk, useIsMounting } from '@hooks';
import { AlertsActions, VotingEscrowsActions, VotingEscrowsSelectors, WalletSelectors } from '@store';
import { AmountInput } from '@components/app';
import { Box, Text, Button } from '@components/common';
import {
  humanize,
  toBN,
  toUnit,
  toWei,
  validateAllowance,
  validateAmount,
  toWeeks,
  getTimeUntil,
  fromWeeks,
  toTime,
  toSeconds,
} from '@utils';

const MAX_LOCK_TIME = '209'; // Weeks
const MIN_LOCK_TIME = '1'; // Weeks
const MIN_LOCK_AMOUNT = '1';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Bullet = styled.li`
  list-style-type: disc;
  margin-left: -1rem;
`;

export const LockTab = () => {
  const { t } = useAppTranslation(['common', 'veyfi']);
  const isMounting = useIsMounting();
  const [lockAmount, setLockAmount] = useState('');
  const [debouncedLockAmount, isDebounceLockAmountPending] = useDebounce(lockAmount, 500);
  const [lockTime, setLockTime] = useState('');
  const [debouncedLockTime, isDebounceLockTimePending] = useDebounce(lockTime, 500);
  const [openAlert] = useExecuteThunk(AlertsActions.openAlert);
  const displayWarning = (error: any) => openAlert({ message: error.message, type: 'warning' });
  const [getLockAllowance, getLockAllowanceStatus, allowance] = useExecuteThunk(VotingEscrowsActions.getLockAllowance);
  const [getExpectedTransactionOutcome, getExpectedTransactionOutcomeStatus, transactionOutcome] = useExecuteThunk(
    VotingEscrowsActions.getExpectedTransactionOutcome,
    displayWarning
  );
  const [approveLock, approveLockStatus] = useExecuteThunk(VotingEscrowsActions.approveLock, displayWarning);
  const [lock, lockStatus] = useExecuteThunk(VotingEscrowsActions.lock, displayWarning);
  const [increaseLockAmount, increaseLockAmountStatus] = useExecuteThunk(
    VotingEscrowsActions.increaseLockAmount,
    displayWarning
  );
  const isWalletConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);

  const hasLockedAmount = toBN(votingEscrow?.DEPOSIT.userDeposited).gt(0);
  const willLock = !!debouncedLockAmount;
  const unlockTime = toBN(Date.now())
    .plus(fromWeeks(toTime(debouncedLockTime)))
    .toNumber();
  const resultAmount =
    hasLockedAmount && !willLock && votingEscrow
      ? toUnit(votingEscrow?.DEPOSIT.userBalance, votingEscrow.decimals)
      : transactionOutcome && votingEscrow && !getExpectedTransactionOutcomeStatus.loading
      ? toUnit(transactionOutcome.targetTokenAmount, votingEscrow.decimals)
      : '';

  useEffect(() => {
    if (!votingEscrow || !votingEscrow?.token.address || !isWalletConnected) return;
    getLockAllowance({
      tokenAddress: votingEscrow.token.address,
      votingEscrowAddress: votingEscrow.address,
    });
  }, [votingEscrow?.address, votingEscrow?.token.address, isWalletConnected]);

  useEffect(() => {
    if (
      !votingEscrow ||
      !willLock ||
      !isApproved ||
      toBN(debouncedLockAmount).lte(0) ||
      toBN(debouncedLockTime).lte(0) ||
      inputError
    )
      return;

    getExpectedTransactionOutcome({
      transactionType: hasLockedAmount ? 'ADD' : 'LOCK',
      tokenAddress: votingEscrow.token.address,
      votingEscrowAddress: votingEscrow.address,
      amount: debouncedLockAmount,
      time: hasLockedAmount ? undefined : toSeconds(unlockTime),
    });
  }, [debouncedLockAmount, debouncedLockTime, votingEscrow?.token.address]);

  useEffect(() => {
    if (!votingEscrow || !hasLockedAmount || willLock) return;
    setLockTime(toWeeks(getTimeUntil(votingEscrow?.unlockDate?.getTime())).toString());
  }, [votingEscrow, votingEscrow?.DEPOSIT.userDeposited, votingEscrow?.unlockDate, hasLockedAmount, willLock]);

  const { approved: isApproved } = validateAllowance({
    tokenAmount: toBN(debouncedLockAmount),
    tokenAddress: votingEscrow?.token.address ?? '',
    tokenDecimals: votingEscrow?.token.decimals.toString() ?? '',
    tokenAllowancesMap: votingEscrow?.token.allowancesMap ?? {},
    spenderAddress: allowance?.spender ?? '',
  });

  const { approved: isValidLockAmount, error: lockAmountError } = validateAmount({
    amount: votingEscrow ? toWei(debouncedLockAmount, votingEscrow.token.decimals) : '0',
    balance: votingEscrow ? votingEscrow.token.balance : '0',
    minAmountAllowed: votingEscrow ? toWei(MIN_LOCK_AMOUNT, votingEscrow.token.decimals) : undefined,
  });

  const { approved: isValidLockTime, error: lockTimeError } = validateAmount({
    amount: votingEscrow ? lockTime : '1',
    minAmountAllowed: MIN_LOCK_TIME,
  });

  const inputError = lockAmountError || lockTimeError;

  const executeApprove = () => {
    if (!votingEscrow) return;
    approveLock({
      tokenAddress: votingEscrow.token.address,
      votingEscrowAddress: votingEscrow.address,
    });
  };

  const executeLock = () => {
    if (!votingEscrow) return;
    lock({
      tokenAddress: votingEscrow.token.address,
      votingEscrowAddress: votingEscrow.address,
      amount: lockAmount,
      time: toSeconds(unlockTime),
    });
  };

  const executeIncreaseLockAmount = () => {
    if (!votingEscrow) return;
    increaseLockAmount({
      tokenAddress: votingEscrow.token.address,
      votingEscrowAddress: votingEscrow.address,
      amount: lockAmount,
    });
  };

  const txAction = !isApproved
    ? {
        label: 'Approve',
        onAction: executeApprove,
        status: approveLockStatus.loading,
        disabled: isMounting || isApproved || getLockAllowanceStatus.loading || !getLockAllowanceStatus.executed,
      }
    : hasLockedAmount
    ? {
        label: 'Lock',
        onAction: executeIncreaseLockAmount,
        status: increaseLockAmountStatus.loading,
        disabled:
          isMounting ||
          !isApproved ||
          !isValidLockAmount ||
          !isValidLockTime ||
          getLockAllowanceStatus.loading ||
          !getLockAllowanceStatus.executed ||
          getExpectedTransactionOutcomeStatus.loading ||
          isDebounceLockAmountPending ||
          isDebounceLockTimePending,
      }
    : {
        label: 'Lock',
        onAction: executeLock,
        status: lockStatus.loading,
        disabled:
          isMounting ||
          !isApproved ||
          !isValidLockAmount ||
          !isValidLockTime ||
          getLockAllowanceStatus.loading ||
          !getLockAllowanceStatus.executed ||
          getExpectedTransactionOutcomeStatus.loading ||
          isDebounceLockAmountPending ||
          isDebounceLockTimePending,
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
      <Box>
        <Text heading="h2" m={0}>
          {t('veyfi:lock-tab.lock-section.header')}
        </Text>
        <Text mt="2.4rem">{t('veyfi:lock-tab.lock-section.desc-1')}</Text>
        <br />
        <Text>{t('veyfi:lock-tab.lock-section.desc-2')}</Text>
        {/* <ul>
          <Bullet>{t('veyfi:lock-tab.lock-section.bullet-1')}</Bullet>
          <Bullet>{t('veyfi:lock-tab.lock-section.bullet-2')}</Bullet>
          <Bullet>{t('veyfi:lock-tab.lock-section.bullet-3')}</Bullet>
        </ul> */}
      </Box>
      <Box mt={['-4rem', '5.6rem']}>
        <Box display="flex" flexDirection={['column', 'column', 'row']} gap="2.4rem">
          <AmountInput
            label={`${votingEscrow?.token.symbol ?? 'YFI'}`}
            amount={lockAmount}
            onAmountChange={setLockAmount}
            maxAmount={votingEscrow ? toUnit(votingEscrow.token.balance, votingEscrow.token.decimals) : '0'}
            message={`Available: ${humanize('amount', votingEscrow?.token.balance, votingEscrow?.token.decimals, 4)} ${
              votingEscrow?.token.symbol ?? 'YFI'
            }`}
            error={lockAmountError}
            width={[1, 1, 1 / 2]}
          />
          <AmountInput
            label={t('veyfi:lock-tab.lock-period')}
            amount={lockTime}
            onAmountChange={setLockTime}
            maxAmount={MAX_LOCK_TIME}
            disabled={hasLockedAmount}
            message="min 1"
            error={lockTimeError}
            width={[1, 1, 1 / 2]}
          />
        </Box>
        <Box display="flex" flexDirection={['column', 'column', 'row']} gap="2.4rem" mt="3.2rem">
          <AmountInput
            label={t('veyfi:lock-tab.total')}
            amount={resultAmount}
            loading={getExpectedTransactionOutcomeStatus.loading}
            width={[1, 1, 1 / 2]}
            disabled
          />
          <Button
            onClick={txAction.onAction}
            disabled={txAction.disabled || txAction.status}
            isLoading={txAction.status}
            success={
              (lockStatus.executed && !lockStatus.error) ||
              (increaseLockAmountStatus.executed && !increaseLockAmountStatus.error)
            }
            filled
            rounded={false}
            width={[1, 1, 1 / 2]}
            height="4rem"
            mt={['0rem', '0rem', '2.2rem']}
          >
            {txAction.label}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
