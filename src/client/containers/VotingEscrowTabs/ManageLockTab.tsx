import { useState, useEffect } from 'react';

import { useAppSelector, useAppTranslation, useDebounce, useExecuteThunk, useIsMounting } from '@hooks';
import { VotingEscrowsActions, VotingEscrowsSelectors, WalletSelectors } from '@store';
import { AmountInput, TxError } from '@components/app';
import { Box, Text, Button } from '@components/common';
import { toBN, toUnit, validateAmount, getTimeUntil, toWeeks, validateNetwork, humanize, format } from '@utils';
import { getConfig } from '@config';

const MAX_LOCK_TIME = '209'; // Weeks
const MIN_LOCK_TIME = '2'; // Weeks

export const ManageLockTab = () => {
  const { t } = useAppTranslation(['common', 'veyfi']);
  const isMounting = useIsMounting();
  const { NETWORK } = getConfig();
  const [lockTime, setLockTime] = useState('');
  const [debouncedLockTime, isDebounceLockTimePending] = useDebounce(lockTime, 500);
  const [extendLockTime, extendLockTimeStatus] = useExecuteThunk(VotingEscrowsActions.extendLockTime);
  const [withdrawLocked, withdrawLockedStatus] = useExecuteThunk(VotingEscrowsActions.withdrawLocked);
  const [getExpectedTransactionOutcome, getExpectedTransactionOutcomeStatus, transactionOutcome] = useExecuteThunk(
    VotingEscrowsActions.getExpectedTransactionOutcome
  );
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
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

  const { error: networkError } = validateNetwork({
    currentNetwork: NETWORK,
    walletNetwork,
  });

  const inputError = lockTimeError;
  const extendError =
    inputError || networkError || getExpectedTransactionOutcomeStatus.error || extendLockTimeStatus.error;
  const exitError = networkError || withdrawLockedStatus.error;

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
    <Box minHeight="35rem">
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap="7.2rem">
        <Box>
          <Text heading="h2">{t('veyfi:manage-tab.extend-section.header')}</Text>
          <Text mt="1.6rem">{t('veyfi:manage-tab.extend-section.desc-1')}</Text>
          <br />
          <Text mt="1.6rem">{t('veyfi:manage-tab.extend-section.desc-2')}</Text>
        </Box>
        <Box>
          <Box mt="0.8rem">
            <Box display="flex" flexDirection={['column', 'row']} gap="1.6rem">
              <AmountInput
                label={t('veyfi:manage-tab.lock-period')}
                amount={weeksToUnlock}
                mt="1.6rem"
                width={[1, 1 / 2]}
                disabled
              />
              <AmountInput
                label={t('veyfi:manage-tab.increase-period')}
                amount={lockTime}
                onAmountChange={setLockTime}
                maxAmount={toBN(MAX_LOCK_TIME).minus(weeksToUnlock).toString()}
                disabled={!hasDeposits}
                message="min 1"
                mt={['0rem', '1.6rem']}
                width={[1, 1 / 2]}
              />
            </Box>
            <Box display="flex" flexDirection={['column', 'row']} alignItems="center" gap="1.6rem">
              <AmountInput
                label={t('veyfi:manage-tab.total')}
                amount={extendResultAmount}
                loading={getExpectedTransactionOutcomeStatus.loading}
                mt="1.6rem"
                width={[1, 1 / 2]}
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
                width={[1, 1 / 2]}
                height="5.6rem"
                mt={['0rem', '4.4rem']}
              >
                Extend
              </Button>
            </Box>
            {extendError && (
              <Box mt="1.6rem">
                <TxError errorType="warning" errorTitle={extendError} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap="7.2rem" mt="6.4rem">
        <Box>
          <Text heading="h2">{t('veyfi:manage-tab.exit-section.header')}</Text>
        </Box>
        <Box>
          <Box mt="0.8rem">
            <Box display="flex" flexDirection={['column', 'row']} gap="1.6rem">
              <AmountInput
                label={t('veyfi:manage-tab.balance')}
                amount={humanize('amount', votingEscrow?.DEPOSIT.userBalance, votingEscrow?.decimals)}
                mt="1.6rem"
                width={[1, 1 / 2]}
                disabled
              />
              <AmountInput
                label={t('veyfi:manage-tab.lock-time')}
                amount={weeksToUnlock}
                mt={['0rem', '1.6rem']}
                width={[1, 1 / 2]}
                disabled
              />
            </Box>
            <Box display="flex" flexDirection={['column', 'row']} alignItems="center" gap="1.6rem">
              <AmountInput
                label={t('veyfi:manage-tab.expected')}
                amount={humanize('amount', exitResultAmount, votingEscrow?.token.decimals)}
                message={`Penalty: ${format('percent', votingEscrow?.earlyExitPenaltyRatio?.toString(), 2)}`}
                mt="1.6rem"
                width={[1, 1 / 2]}
                disabled
              />
              <Button
                onClick={executeWithdrawLocked}
                isLoading={withdrawLockedStatus.loading}
                success={withdrawLockedStatus.executed && !withdrawLockedStatus.error}
                disabled={!hasLockedAmount || withdrawLockedStatus.loading}
                filled
                width={[1, 1 / 2]}
                height="5.6rem"
                mt={['0rem', '2.4rem']}
              >
                Exit
              </Button>
            </Box>
            {exitError && (
              <Box mt="1.6rem">
                <TxError errorType="warning" errorTitle={exitError} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
