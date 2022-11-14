import { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppTranslation, useDebounce, useExecuteThunk, useIsMounting } from '@hooks';
import { VotingEscrowsActions, VotingEscrowsSelectors, WalletSelectors } from '@store';
import { AmountInput, TxError } from '@components/app';
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
  validateNetwork,
} from '@utils';
import { getConfig } from '@config';

const MAX_LOCK_TIME = '209'; // Weeks
const MIN_LOCK_TIME = '1'; // Weeks
const MIN_LOCK_AMOUNT = '1';

const Bullet = styled.li`
  list-style-type: disc;
  margin-left: 2.4rem;
`;

export const LockTab = () => {
  const { t } = useAppTranslation(['common', 'veyfi']);
  const isMounting = useIsMounting();
  const { NETWORK } = getConfig();
  const [lockAmount, setLockAmount] = useState('');
  const [debouncedLockAmount, isDebounceLockAmountPending] = useDebounce(lockAmount, 500);
  const [lockTime, setLockTime] = useState('');
  const [debouncedLockTime, isDebounceLockTimePending] = useDebounce(lockTime, 500);
  const [getLockAllowance, getLockAllowanceStatus, allowance] = useExecuteThunk(VotingEscrowsActions.getLockAllowance);
  const [getExpectedTransactionOutcome, getExpectedTransactionOutcomeStatus, transactionOutcome] = useExecuteThunk(
    VotingEscrowsActions.getExpectedTransactionOutcome
  );
  const [approveLock, approveLockStatus] = useExecuteThunk(VotingEscrowsActions.approveLock);
  const [lock, lockStatus] = useExecuteThunk(VotingEscrowsActions.lock);
  const [increaseLockAmount, increaseLockAmountStatus] = useExecuteThunk(VotingEscrowsActions.increaseLockAmount);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const isWalletConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);

  const hasLockedAmount = toBN(votingEscrow?.DEPOSIT.userDeposited).gt(0);
  const willLock = !!debouncedLockAmount;
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
      time: hasLockedAmount ? undefined : toBN(debouncedLockTime).toNumber(),
    });
  }, [debouncedLockAmount, debouncedLockTime, votingEscrow?.token]);

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

  const { error: networkError } = validateNetwork({
    currentNetwork: NETWORK,
    walletNetwork,
  });

  const inputError = lockAmountError || lockTimeError;
  const error =
    inputError ||
    networkError ||
    getExpectedTransactionOutcomeStatus.error ||
    approveLockStatus.error ||
    lockStatus.error ||
    increaseLockAmountStatus.error;

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
      time: parseInt(lockTime),
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
    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))" minHeight="35rem" gap="7.2rem">
      <Box>
        <Text heading="h2">{t('veyfi:lock-tab.lock-section.header')}</Text>
        <Text mt="1.6rem">{t('veyfi:lock-tab.lock-section.desc-1')}</Text>
        <br />
        <Text>{t('veyfi:lock-tab.lock-section.desc-2')}</Text>
        <br />
        <ul>
          <Bullet>{t('veyfi:lock-tab.lock-section.bullet-1')}</Bullet>
          <Bullet>{t('veyfi:lock-tab.lock-section.bullet-2')}</Bullet>
          <Bullet>{t('veyfi:lock-tab.lock-section.bullet-3')}</Bullet>
        </ul>
      </Box>
      <Box>
        <Box mt="0.8rem">
          <Text heading="h3">{t('veyfi:lock-tab.locking')}</Text>
          <Box display="flex" flexDirection={['column', 'row']} gap="1.6rem">
            <AmountInput
              label={`${votingEscrow?.token.symbol ?? 'YFI'}`}
              amount={lockAmount}
              onAmountChange={setLockAmount}
              maxAmount={votingEscrow ? toUnit(votingEscrow.token.balance, votingEscrow.token.decimals) : '0'}
              message={`Available: ${humanize(
                'amount',
                votingEscrow?.token.balance,
                votingEscrow?.token.decimals,
                4
              )} ${votingEscrow?.token.symbol ?? 'YFI'}`}
              mt="1.6rem"
              width={[1, 1 / 2]}
            />
            <AmountInput
              label={t('veyfi:lock-tab.lock-period')}
              amount={lockTime}
              onAmountChange={setLockTime}
              maxAmount={MAX_LOCK_TIME}
              disabled={hasLockedAmount}
              message="min 1"
              mt={['0rem', '1.6rem']}
              width={[1, 1 / 2]}
            />
          </Box>
          <Box display="flex" flexDirection={['column', 'row']} alignItems="center" gap="1.6rem">
            <AmountInput
              label={t('veyfi:lock-tab.total')}
              amount={resultAmount}
              loading={getExpectedTransactionOutcomeStatus.loading}
              mt="1.6rem"
              width={[1, 1 / 2]}
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
              width={[1, 1 / 2]}
              height="5.6rem"
              mt={['0rem', '4.4rem']}
            >
              {txAction.label}
            </Button>
          </Box>

          {error && (
            <Box mt="1.6rem">
              <TxError errorType="warning" errorTitle={error} />
            </Box>
          )}
        </Box>
        {/* TODO: add once functionality gets added */}
        {/* <Box mt="2.4rem">
          <Text heading="h3">Auto-re-lock</Text>
          <Box display="flex" alignItems="center" justifyContent="space-between" width={1 / 2} pr="0.8rem" mt="1.6rem">
            <Text>Enabled</Text>
            <ToggleButton selected={false} setSelected={() => {}} />
          </Box>
        </Box> */}
      </Box>
    </Box>
  );
};
