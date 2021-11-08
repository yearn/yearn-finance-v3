import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap, useDebounce, useAppTranslation } from '@hooks';
import { IronBankSelectors, IronBankActions } from '@store';
import { toBN, normalizeAmount, USDC_DECIMALS, basicValidateAmount, toWei, humanize } from '@utils';
import { getConfig } from '@config';

import { IronBankTransaction } from '../IronBankTransaction';

export interface IronBankBorrowTxProps {
  onClose?: () => void;
}

export const IronBankBorrowTx: FC<IronBankBorrowTxProps> = ({ onClose }) => {
  const { t } = useAppTranslation('common');

  const { IRON_BANK_MAX_RATIO } = getConfig();
  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [amount, setAmount] = useState('');
  const [debouncedAmount] = useDebounce(amount, 500);
  const [txCompleted, setTxCompleted] = useState(false);
  const selectedMarket = useAppSelector(IronBankSelectors.selectSelectedMarket);
  const selectedToken = selectedMarket?.token;
  const userIronBankSummary = useAppSelector(IronBankSelectors.selectSummaryData);
  const actionsStatus = useAppSelector(IronBankSelectors.selectSelectedMarketActionsStatusMap);

  const onExit = () => {
    dispatch(IronBankActions.clearSelectedMarketAndStatus());
  };

  useEffect(() => {
    return () => {
      onExit();
    };
  }, []);

  useEffect(() => {
    if (!selectedMarket || !generalError) return;
    dispatch(IronBankActions.clearMarketStatus({ marketAddress: selectedMarket.address }));
  }, [debouncedAmount]);

  if (!selectedMarket || !userIronBankSummary || !selectedToken) {
    return null;
  }

  const borrowBalance = normalizeAmount(userIronBankSummary.borrowBalanceUsdc, USDC_DECIMALS);
  const underlyingTokenPrice = normalizeAmount(selectedToken.priceUsdc, USDC_DECIMALS);
  const amountValue = toBN(amount).times(underlyingTokenPrice).toString();
  const borrowLimit = normalizeAmount(userIronBankSummary.borrowLimitUsdc, USDC_DECIMALS);

  const projectedBorrowBalance = toBN(borrowBalance).plus(amountValue).toString();
  const maxAllowedBorrowBalance = toBN(borrowLimit).times(IRON_BANK_MAX_RATIO).toString();
  const availableCollateral = toBN(maxAllowedBorrowBalance).minus(borrowBalance).toString();
  let borrowableTokens = toBN(underlyingTokenPrice).gt(0)
    ? toBN(availableCollateral).div(underlyingTokenPrice).toString()
    : '0';
  borrowableTokens = toBN(borrowableTokens).lt(0) ? '0' : borrowableTokens;
  borrowableTokens = toBN(borrowableTokens).toFixed(selectedToken.decimals);
  const borrowingTokens = normalizeAmount(selectedMarket.BORROW.userDeposited, selectedMarket.token.decimals);
  const projectedBorrowingTokens = toBN(borrowingTokens).plus(toBN(amount)).toString();

  const asset = {
    ...selectedToken,
    balance: toWei(borrowableTokens, selectedToken.decimals),
    balanceUsdc: toWei(toBN(borrowableTokens).times(underlyingTokenPrice).toString(), USDC_DECIMALS),
    yield: humanize('percent', selectedMarket.borrowApy),
  };

  const { approved: isValidAmount, error: inputError } = basicValidateAmount({
    sellTokenAmount: toBN(amount),
    sellTokenDecimals: selectedToken.decimals.toString(),
    totalAmountAvailable: toWei(borrowableTokens, selectedToken.decimals),
  });

  const sourceError = inputError;
  const targetError = actionsStatus.borrow.error;
  const generalError = sourceError || targetError;

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const borrow = async () => {
    try {
      await dispatchAndUnwrap(
        IronBankActions.borrowMarket({
          marketAddress: selectedMarket.address,
          amount: toBN(amount),
        })
      );
      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: t('components.transaction.borrow'),
      onAction: borrow,
      status: actionsStatus.borrow,
      disabled: !isValidAmount,
      contrast: true,
    },
  ];

  return (
    <IronBankTransaction
      transactionLabel={t('components.transaction.borrow')}
      transactionCompleted={txCompleted}
      transactionCompletedLabel={t('components.transaction.status.exit')}
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      assetHeader={t('components.transaction.from-iron-bank')}
      assetLabel={t('components.transaction.available-borrow')}
      asset={asset}
      amount={amount}
      amountValue={amountValue}
      safeMax={borrowableTokens}
      onAmountChange={setAmount}
      borrowBalance={borrowBalance}
      projectedBorrowBalance={projectedBorrowBalance}
      borrowLimit={borrowLimit}
      borrowingTokens={borrowingTokens}
      projectedBorrowingTokens={projectedBorrowingTokens}
      yieldType={'BORROW'}
      actions={txActions}
      sourceStatus={{ error: sourceError }}
      targetStatus={{ error: targetError }}
      onClose={onClose}
    />
  );
};
