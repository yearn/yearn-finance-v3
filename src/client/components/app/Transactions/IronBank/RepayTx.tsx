import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap, useDebounce } from '@hooks';
import { IronBankSelectors, IronBankActions, TokensActions } from '@store';
import {
  toBN,
  normalizeAmount,
  normalizePercent,
  USDC_DECIMALS,
  basicValidateAmount,
  toWei,
  validateAllowance,
} from '@src/utils';

import { IronBankTransaction } from '../IronBankTransaction';

export interface IronBankRepayTxProps {
  onClose?: () => void;
}

export const IronBankRepayTx: FC<IronBankRepayTxProps> = ({ onClose }) => {
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
    if (!selectedMarket) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedMarket.token.address,
        spenderAddress: selectedMarket.address,
      })
    );
  }, [selectedMarket?.address]);

  useEffect(() => {
    if (!selectedMarket || !error) return;
    dispatch(IronBankActions.clearMarketStatus({ marketAddress: selectedMarket.address }));
  }, [debouncedAmount]);

  if (!selectedMarket || !userIronBankSummary || !selectedToken) {
    return null;
  }

  const borrowBalance = normalizeAmount(userIronBankSummary.borrowBalanceUsdc, USDC_DECIMALS);
  const underlyingTokenPrice = normalizeAmount(selectedToken.priceUsdc, USDC_DECIMALS);
  const amountValue = toBN(amount).times(underlyingTokenPrice).toString();
  const borrowLimit = normalizeAmount(userIronBankSummary.borrowLimitUsdc, USDC_DECIMALS);

  const projectedBorrowBalance = toBN(borrowBalance).minus(amountValue).toString();
  const borrowedTokens = normalizeAmount(selectedMarket.BORROW.userDeposited, selectedToken.decimals);
  const tokenBalance = normalizeAmount(selectedToken.balance, selectedToken.decimals);
  let repayableTokens = toBN(tokenBalance).gt(borrowedTokens) ? borrowedTokens : tokenBalance;
  repayableTokens = toBN(repayableTokens).toFixed(selectedToken.decimals);
  const borrowingTokens = normalizeAmount(selectedMarket.BORROW.userDeposited, selectedMarket.token.decimals);
  const projectedBorrowingTokens = toBN(borrowingTokens).minus(toBN(amount)).toString();
  const percentageToRepay = toBN(amount).div(borrowedTokens).times(100).toString();
  const willRepayAll = toBN(percentageToRepay).gte(99);

  const asset = {
    ...selectedToken,
    balance: selectedToken.balance,
    balanceUsdc: selectedToken.balanceUsdc,
    yield: normalizePercent(selectedMarket.borrowApy, 2),
  };

  const { approved: isApproved, error: allowanceError } = validateAllowance({
    tokenAmount: toBN(amount),
    tokenAddress: selectedToken.address,
    tokenDecimals: selectedToken.decimals.toString(),
    tokenAllowancesMap: selectedToken.allowancesMap,
    spenderAddress: selectedMarket.address,
  });

  const { approved: isValidAmount, error: inputError } = basicValidateAmount({
    sellTokenAmount: toBN(amount),
    sellTokenDecimals: selectedToken.decimals.toString(),
    totalAmountAvailable: selectedToken.balance,
    maxAmountAllowed: toWei(repayableTokens, selectedToken.decimals),
  });

  const error = allowanceError || inputError || actionsStatus.approve.error || actionsStatus.repay.error;

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const approve = async () => {
    await dispatch(
      IronBankActions.approveMarket({
        marketAddress: selectedMarket.address,
        tokenAddress: selectedToken.address,
      })
    );
  };

  const repay = async () => {
    try {
      if (willRepayAll) {
        await dispatchAndUnwrap(
          IronBankActions.repayAllMarket({
            marketAddress: selectedMarket.address,
          })
        );
      } else {
        await dispatchAndUnwrap(
          IronBankActions.repayMarket({
            marketAddress: selectedMarket.address,
            amount: toBN(amount),
          })
        );
      }
      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: 'Approve',
      onAction: approve,
      status: actionsStatus.approve,
      disabled: isApproved,
    },
    {
      label: 'Repay',
      onAction: repay,
      status: actionsStatus.repay,
      disabled: !isApproved || !isValidAmount,
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
      assetLabel="Wallet Balance"
      asset={asset}
      amount={amount}
      amountValue={amountValue}
      safeMax={repayableTokens}
      maxLabel="MAX"
      onAmountChange={setAmount}
      borrowBalance={borrowBalance}
      projectedBorrowBalance={projectedBorrowBalance}
      borrowLimit={borrowLimit}
      borrowingTokens={borrowingTokens}
      projectedBorrowingTokens={projectedBorrowingTokens}
      yieldType={'BORROW'}
      actions={txActions}
      sourceStatus={{ error }}
      targetStatus={{ error }}
      onClose={onClose}
    />
  );
};
