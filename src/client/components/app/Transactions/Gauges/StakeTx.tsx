import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppTranslation, useExecuteThunk } from '@hooks';
import { NetworkSelectors, WalletSelectors, GaugesActions, GaugesSelectors } from '@store';
import { toBN, toWei, validateNetwork, validateAllowance, validateAmount } from '@utils';

import { SimpleTransaction } from '../SimpleTransaction';

export interface StakeTxProps {
  header?: string;
  onClose?: () => void;
}

export const StakeTx: FC<StakeTxProps> = ({ header, onClose }) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const [amount, setAmount] = useState('');
  const [getStakeAllowance, getStakeAllowanceStatus, allowance] = useExecuteThunk(GaugesActions.getStakeAllowance);
  const [approveStake, approveStakeStatus] = useExecuteThunk(GaugesActions.approveStake);
  const [stake, stakeStatus] = useExecuteThunk(GaugesActions.stake);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const isWalletConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const gauge = useAppSelector(GaugesSelectors.selectSelectedGauge);

  useEffect(() => {
    return () => {
      dispatch(GaugesActions.clearSelectedGauge());
    };
  }, []);

  useEffect(() => {
    if (!gauge || !isWalletConnected) return;
    getStakeAllowance({
      tokenAddress: gauge.token.address,
      gaugeAddress: gauge.address,
    });
  }, [gauge?.address, isWalletConnected]);

  if (!gauge) return null;

  const { approved: isApproved, error: allowanceError } = validateAllowance({
    tokenAmount: toBN(amount),
    tokenAddress: gauge.token.address,
    tokenDecimals: gauge.token.decimals.toString(),
    tokenAllowancesMap: gauge.token.allowancesMap,
    spenderAddress: allowance?.spender ?? '',
  });

  const { approved: isValidAmount, error: inputError } = validateAmount({
    amount: toWei(amount, gauge.token.decimals),
    balance: gauge.token.balance,
  });

  const { error: networkError } = validateNetwork({
    currentNetwork,
    walletNetwork,
  });

  const error = networkError || allowanceError || inputError;

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const approveStakeHandler = async () => {
    await approveStake({ tokenAddress: gauge.token.address, gaugeAddress: gauge.address });
  };

  const stakeHandler = async () => {
    await stake({
      tokenAddress: gauge.token.address,
      gaugeAddress: gauge.address,
      amount,
    });
  };

  const txActions = [
    {
      label: t('components.transaction.approve'),
      onAction: approveStakeHandler,
      status: approveStakeStatus,
      disabled: isApproved || getStakeAllowanceStatus.loading,
    },
    {
      label: t('components.transaction.stake'),
      onAction: stakeHandler,
      status: stakeStatus,
      disabled: !isApproved || !isValidAmount,
    },
  ];

  return (
    <SimpleTransaction
      actions={txActions}
      amount={amount}
      header={t('components.transaction.stake')}
      onAmountChange={setAmount}
      onClose={onClose}
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      selectedAsset={gauge.token}
      status={{ error }}
      transactionCompleted={!!stakeStatus.executed}
    />
  );
};
