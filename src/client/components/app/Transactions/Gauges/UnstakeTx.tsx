import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppTranslation, useExecuteThunk } from '@hooks';
import { NetworkSelectors, WalletSelectors, GaugesActions, GaugesSelectors } from '@store';
import { toWei, validateNetwork, validateAmount } from '@utils';

import { SimpleTransaction } from '../SimpleTransaction';

export interface UnstakeTxProps {
  header?: string;
  onClose?: () => void;
}

export const UnstakeTx: FC<UnstakeTxProps> = ({ header, onClose }) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const [amount, setAmount] = useState('');
  const [unstake, unstakeStatus] = useExecuteThunk(GaugesActions.unstake);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const gauge = useAppSelector(GaugesSelectors.selectSelectedGauge);

  useEffect(() => {
    return () => {
      dispatch(GaugesActions.clearSelectedGauge());
    };
  }, []);

  if (!gauge) return null;

  const { approved: isValidAmount, error: inputError } = validateAmount({
    amount: toWei(amount, gauge.token.decimals),
    balance: gauge.token.balance,
  });

  const { error: networkError } = validateNetwork({
    currentNetwork,
    walletNetwork,
  });

  const gaugeOption = {
    address: gauge.address,
    symbol: gauge.token.symbol,
    icon: '',
    balance: gauge.DEPOSIT.userDeposited,
    balanceUsdc: gauge.DEPOSIT.userDepositedUsdc,
    decimals: gauge.token.decimals,
  };

  const sourceError = networkError || inputError;

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const unstakeHandler = async () => {
    await unstake({
      tokenAddress: gauge.token.address,
      gaugeAddress: gauge.address,
      amount,
    });
  };

  const txActions = [
    {
      label: t('components.transaction.unstake'),
      onAction: unstakeHandler,
      status: unstakeStatus,
      disabled: !isValidAmount,
    },
  ];

  return (
    <SimpleTransaction
      actions={txActions}
      amount={amount}
      header={t('components.transaction.unstake')}
      onAmountChange={setAmount}
      onClose={onClose}
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      selectedAsset={gaugeOption}
      status={{ error: sourceError }}
      transactionCompleted={!!unstakeStatus.executed}
    />
  );
};
