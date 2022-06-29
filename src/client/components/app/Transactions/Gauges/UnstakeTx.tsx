import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppTranslation, useExecuteThunk } from '@hooks';
import { NetworkSelectors, WalletSelectors, GaugesActions, GaugesSelectors } from '@store';
import { toBN, normalizeAmount, toWei, USDC_DECIMALS, validateNetwork, validateAmount } from '@utils';

import { Transaction } from '../Transaction';

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

  const amountValue = toBN(amount).times(normalizeAmount(gauge.token.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = amount;
  const expectedAmountValue = amountValue;

  const sourceError = networkError || inputError;
  const targetError = unstakeStatus.error;

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const unstakeHandler = async () => {
    await unstake({
      tokenAddress: gauge.token.address,
      gaugeAddress: gauge.address,
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
    <Transaction
      transactionLabel={header}
      transactionCompleted={!!unstakeStatus.executed}
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader={t('components.transaction.from-gauge')}
      sourceAssetOptions={[gaugeOption]}
      selectedSourceAsset={gaugeOption}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      onSourceAmountChange={setAmount}
      sourceStatus={{ error: sourceError }}
      targetHeader={t('components.transaction.to-vault')}
      targetAssetOptions={[gauge.token]}
      selectedTargetAsset={gauge.token}
      targetAmountDisabled={false}
      targetAmount={expectedAmount}
      targetAmountValue={expectedAmountValue}
      targetStatus={{ error: targetError }}
      actions={txActions}
      onClose={onClose}
    />
  );
};
