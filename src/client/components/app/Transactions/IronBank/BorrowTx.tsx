import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap } from '@hooks';
import { IronBankSelectors, IronBankActions } from '@store';
import { toBN, normalizeAmount, normalizePercent, USDC_DECIMALS } from '@src/utils';
import { getConfig } from '@config';

import { IronBankTransaction } from '../IronBankTransaction';

export interface IronBankBorrowTxProps {
  onClose?: () => void;
}

export const IronBankBorrowTx: FC<IronBankBorrowTxProps> = ({ onClose }) => {
  const { IRON_BANK_MAX_RATIO } = getConfig();
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

  const error = inputError || actionsStatus.borrow.error;

  const borrowBalance = normalizeAmount(userIronBankSummary.borrowBalanceUsdc, USDC_DECIMALS);
  const underlyingTokenPrice = normalizeAmount(selectedMarket.token.priceUsdc, USDC_DECIMALS);
  const amountValue = toBN(amount).times(underlyingTokenPrice).toString();
  const borrowLimit = normalizeAmount(userIronBankSummary.borrowLimitUsdc, USDC_DECIMALS);

  const proyectedBorrowBalance = toBN(borrowBalance).plus(amountValue).toString();
  const maxAllowedBorrowBalance = toBN(borrowLimit).times(IRON_BANK_MAX_RATIO).toString();
  const availableCollateral = toBN(maxAllowedBorrowBalance).minus(borrowBalance).toString();
  let borrowableTokens = toBN(availableCollateral).div(underlyingTokenPrice).toString();
  borrowableTokens = toBN(borrowableTokens).lt(0) ? '0' : borrowableTokens;

  const asset = {
    ...selectedMarket.token,
    balance: selectedMarket.BORROW.userDeposited,
    yield: normalizePercent(selectedMarket.borrowApy, 2),
  };

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
      label: 'Borrow',
      onAction: borrow,
      status: actionsStatus.withdraw,
      disabled: !isValidAmount,
      contrast: true,
    },
  ];

  return (
    <IronBankTransaction
      transactionLabel="Borrow"
      transactionCompleted={txCompleted}
      transactionCompletedLabel="Exit"
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      assetHeader="From Iron Bank"
      asset={asset}
      amount={amount}
      amountValue={amountValue}
      safeMax={borrowableTokens}
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
