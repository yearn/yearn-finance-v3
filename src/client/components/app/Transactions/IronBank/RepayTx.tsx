import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap } from '@hooks';
import { IronBankSelectors, IronBankActions } from '@store';
import { toBN, normalizeAmount, normalizePercent, USDC_DECIMALS } from '@src/utils';

import { IronBankTransaction } from '../IronBankTransaction';

export interface IronBankRepayTxProps {
  onClose?: () => void;
}

export const IronBankRepayTx: FC<IronBankRepayTxProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [amount, setAmount] = useState('');
  const [txCompleted, setTxCompleted] = useState(false);
  const selectedMarket = useAppSelector(IronBankSelectors.selectSelectedMarket);
  const userIronBankSummary = useAppSelector(IronBankSelectors.selectUserIronBankSummary);
  const actionsStatus = useAppSelector(IronBankSelectors.selectSelectedMarketActionsStatusMap);

  const onExit = () => {
    dispatch(IronBankActions.clearSelectedMarketAndStatus());
  };

  useEffect(() => {
    return () => {
      onExit();
    };
  }, []);

  if (!selectedMarket || !userIronBankSummary) {
    return null;
  }

  // TODO: validations
  const { approved: isValidAmount, error: inputError } = { approved: true, error: undefined };

  const error = inputError || actionsStatus.repay.error;

  const borrowBalance = normalizeAmount(userIronBankSummary.borrowBalanceUsdc, USDC_DECIMALS);
  const underlyingTokenPrice = normalizeAmount(selectedMarket.token.priceUsdc, USDC_DECIMALS);
  const amountValue = toBN(amount).times(underlyingTokenPrice).toString();
  const borrowLimit = normalizeAmount(userIronBankSummary.borrowLimitUsdc, USDC_DECIMALS);

  const proyectedBorrowBalance = toBN(borrowBalance).minus(amountValue).toString();
  const borrowedTokens = normalizeAmount(selectedMarket.BORROW.userDeposited, selectedMarket.token.decimals);
  const tokenBalance = normalizeAmount(selectedMarket.token.balance, selectedMarket.token.decimals);
  const repayableTokens = toBN(tokenBalance).gt(borrowedTokens) ? borrowedTokens : tokenBalance;

  const asset = {
    ...selectedMarket.token,
    balance: selectedMarket.BORROW.userDeposited,
    yield: normalizePercent(selectedMarket.borrowApy, 2),
  };

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const repay = async () => {
    try {
      await dispatchAndUnwrap(
        IronBankActions.repayMarket({
          marketAddress: selectedMarket.address,
          amount: toBN(amount),
        })
      );
      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: 'Repay',
      onAction: repay,
      status: actionsStatus.repay,
      disabled: !isValidAmount,
      contrast: true,
    },
  ];

  return (
    <IronBankTransaction
      transactionLabel="Repay"
      transactionCompleted={txCompleted}
      transactionCompletedLabel="Exit"
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      assetHeader="To Iron Bank"
      asset={asset}
      amount={amount}
      amountValue={amountValue}
      safeMax={repayableTokens}
      maxLabel="MAX"
      onAmountChange={setAmount}
      borrowBalance={borrowBalance}
      proyectedBorrowBalance={proyectedBorrowBalance}
      borrowLimit={borrowLimit}
      yieldType={'BORROW'}
      actions={txActions}
      status={{ error }}
      onClose={onClose}
    />
  );
};
