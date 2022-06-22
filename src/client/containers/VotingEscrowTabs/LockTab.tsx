import { useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap, useDebounce } from '@hooks';
import { VotingEscrowsActions, VotingEscrowsSelectors, WalletSelectors } from '@store';
import { AmountInput } from '@components/app';
import { Box, Text, Button, ToggleButton } from '@components/common';
import { humanize, toBN, toUnit, toWei, validateAllowance, validateAmount } from '@utils';

const MAX_LOCK_TIME = '208'; // Weeks

export const LockTab = () => {
  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [lockAmount, setLockAmount] = useState('');
  const [debouncedLockAmount, isDebounceLockAmountPending] = useDebounce(lockAmount, 500);
  const [lockTime, setLockTime] = useState('');
  const [debouncedLockTime, isDebounceLockTimePending] = useDebounce(lockTime, 500);
  const [spenderAddress, setSpenderAddress] = useState('');
  const [isFetchingAllowance, setIsFetchingAllowance] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [resultAmount, setResultAmount] = useState('');
  const isWalletConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const votingEscrow = useAppSelector(VotingEscrowsSelectors.selectSelectedVotingEscrow);

  useEffect(() => {
    if (!votingEscrow || !isWalletConnected) return;
    const fetchAllowance = async () => {
      setIsFetchingAllowance(true);
      setSpenderAddress('');
      const allowance = await dispatchAndUnwrap(
        VotingEscrowsActions.getLockAllowance({
          tokenAddress: votingEscrow.token.address,
          votingEscrowAddress: votingEscrow.address,
        })
      );
      setSpenderAddress(allowance.spender);
      setIsFetchingAllowance(false);
    };
    fetchAllowance();
  }, [votingEscrow?.address, isWalletConnected]);

  useEffect(() => {
    if (!votingEscrow || toBN(debouncedLockAmount).lte(0) || toBN(debouncedLockTime).lte(0) || inputError) return;
    const getExpectedTransactionOutcome = async () => {
      const transactionOutcome = await dispatchAndUnwrap(
        VotingEscrowsActions.getExpectedTransactionOutcome({
          transactionType: 'LOCK',
          tokenAddress: votingEscrow.token.address,
          votingEscrowAddress: votingEscrow.address,
          amount: debouncedLockAmount,
          time: toBN(debouncedLockTime).toNumber(),
        })
      );
      setResultAmount(toUnit(transactionOutcome.targetTokenAmount, votingEscrow.decimals));
    };
    getExpectedTransactionOutcome();
  }, [debouncedLockAmount, debouncedLockTime]);

  const { approved: isApproved, error: allowanceError } = validateAllowance({
    tokenAmount: toBN(debouncedLockAmount),
    tokenAddress: votingEscrow?.token.address ?? '',
    tokenDecimals: votingEscrow?.token.decimals.toString() ?? '',
    tokenAllowancesMap: votingEscrow?.token.allowancesMap ?? {},
    spenderAddress,
  });

  const { approved: isValidLockAmount, error: lockAmountError } = validateAmount({
    amount: votingEscrow ? toWei(debouncedLockAmount, votingEscrow.token.decimals) : '0',
    balance: votingEscrow ? votingEscrow.token.balance : '0',
  });

  const { approved: isValidLockTime, error: lockTimeError } = validateAmount({
    amount: votingEscrow ? lockTime : '1',
    maxAmountAllowed: MAX_LOCK_TIME,
  });

  const inputError = lockAmountError || lockTimeError;

  const approve = async () => {
    if (!votingEscrow) return;
    setIsApproving(true);
    await dispatch(
      VotingEscrowsActions.approveLock({
        tokenAddress: votingEscrow.token.address,
        votingEscrowAddress: votingEscrow.address,
      })
    );
    setIsApproving(false);
  };

  const lock = async () => {
    if (!votingEscrow) return;
    setIsLocking(true);
    await dispatch(
      VotingEscrowsActions.lock({
        tokenAddress: votingEscrow.token.address,
        votingEscrowAddress: votingEscrow.address,
        amount: lockAmount,
        time: parseInt(lockTime),
      })
    );
    setIsLocking(false);
  };

  const txAction = !isApproved
    ? {
        label: 'Approve',
        onAction: approve,
        status: isApproving,
        disabled: isApproved || isFetchingAllowance,
      }
    : {
        label: 'Lock',
        onAction: lock,
        status: isLocking,
        disabled:
          !isApproved ||
          !isValidLockAmount ||
          !isValidLockTime ||
          isDebounceLockAmountPending ||
          isDebounceLockTimePending,
      };

  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))">
      <Box>
        <Text heading="h2">Lock YFI into veYFI</Text>
        <Text>Description goes here</Text>
      </Box>
      <Box>
        <Box mt="0.8rem">
          <Text heading="h3">Locking</Text>
          <Box display="flex" gap="1.6rem">
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
              width={1 / 2}
            />
            <AmountInput
              label="Lock time (weeks)"
              amount={lockTime}
              onAmountChange={setLockTime}
              maxAmount={MAX_LOCK_TIME}
              message="min 1"
              mt="1.6rem"
              width={1 / 2}
            />
          </Box>
          <Box display="flex" alignItems="center" gap="1.6rem">
            <AmountInput label="Total veYFI" amount={resultAmount} mt="1.6rem" width={1 / 2} disabled />
            <Button
              onClick={txAction.onAction}
              disabled={txAction.disabled}
              filled
              width={1 / 2}
              height="5.6rem"
              mt="4rem"
            >
              {txAction.label}
            </Button>
          </Box>
        </Box>
        <Box mt="2.4rem">
          <Text heading="h3">Auto-re-lock</Text>
          <Box display="flex" alignItems="center" justifyContent="space-between" width={1 / 2} pr="0.8rem" mt="1.6rem">
            <Text>Enabled</Text>
            <ToggleButton selected={false} setSelected={() => {}} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
