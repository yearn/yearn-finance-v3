import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap } from '@hooks';
import { IronBankSelectors, IronBankActions } from '@store';
import { toBN, normalizeAmount, normalizePercent, USDC_DECIMALS, basicValidateAmount, toWei } from '@src/utils';
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
  let borrowableTokens = toBN(availableCollateral).div(underlyingTokenPrice).toString();
  borrowableTokens = toBN(borrowableTokens).lt(0) ? '0' : borrowableTokens;
  borrowableTokens = toBN(borrowableTokens).toFixed(selectedToken.decimals);
  const borrowingTokens = normalizeAmount(selectedMarket.BORROW.userDeposited, selectedMarket.token.decimals);
  const projectedBorrowingTokens = toBN(borrowingTokens).plus(toBN(amount)).toString();

  const asset = {
    ...selectedToken,
    balance: toWei(borrowableTokens, selectedToken.decimals),
    balanceUsdc: toWei(toBN(borrowableTokens).times(underlyingTokenPrice).toString(), USDC_DECIMALS),
    yield: normalizePercent(selectedMarket.borrowApy, 2),
  };

  const { approved: isValidAmount, error: inputError } = basicValidateAmount({
    sellTokenAmount: toBN(amount),
    sellTokenDecimals: selectedToken.decimals.toString(),
    totalAmountAvailable: toWei(borrowableTokens, selectedToken.decimals),
  });

  const error = inputError || actionsStatus.borrow.error;

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
      status: actionsStatus.borrow,
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
      assetLabel="Available to Borrow"
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
      status={{ error }}
      onClose={onClose}
    />
  );
};
