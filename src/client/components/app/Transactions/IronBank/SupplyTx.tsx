import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap } from '@hooks';
import { IronBankSelectors, TokensActions, IronBankActions } from '@store';
import {
  toBN,
  normalizeAmount,
  normalizePercent,
  USDC_DECIMALS,
  validateAllowance,
  basicValidateAmount,
  COLLATERAL_FACTOR_DECIMALS,
} from '@src/utils';

import { IronBankTransaction } from '../IronBankTransaction';

export interface IronBankSupplyTxProps {
  onClose?: () => void;
}

export const IronBankSupplyTx: FC<IronBankSupplyTxProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [amount, setAmount] = useState('');
  const [txCompleted, setTxCompleted] = useState(false);
  const selectedMarket = useAppSelector(IronBankSelectors.selectSelectedMarket);
  const selectedToken = selectedMarket?.token;
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

  useEffect(() => {
    if (!selectedMarket) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedMarket.token.address,
        spenderAddress: selectedMarket.address,
      })
    );
  }, [selectedMarket?.address]);

  if (!selectedMarket || !userIronBankSummary || !selectedToken) {
    return null;
  }

  const borrowBalance = normalizeAmount(userIronBankSummary.borrowBalanceUsdc, USDC_DECIMALS);
  const underlyingTokenPrice = normalizeAmount(selectedToken.priceUsdc, USDC_DECIMALS);
  const amountValue = toBN(amount).times(underlyingTokenPrice).toString();
  const collateralFactor = normalizeAmount(selectedMarket.collateralFactor, COLLATERAL_FACTOR_DECIMALS);
  const collateralAmount = toBN(amountValue).times(collateralFactor).toString();
  const borrowLimit = normalizeAmount(userIronBankSummary.borrowLimitUsdc, USDC_DECIMALS);

  const projectedBorrowLimit = toBN(borrowLimit).plus(collateralAmount).toString();
  const asset = { ...selectedToken, yield: normalizePercent(selectedMarket.lendApy, 2) };

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
  });

  const error = allowanceError || inputError || actionsStatus.approve.error || actionsStatus.supply.error;

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

  const supply = async () => {
    try {
      await dispatchAndUnwrap(
        IronBankActions.supplyMarket({
          marketAddress: selectedMarket.address,
          amount: toBN(amount),
        })
      );
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
      label: 'Supply',
      onAction: supply,
      status: actionsStatus.supply,
      disabled: !isApproved || !isValidAmount,
      contrast: true,
    },
  ];

  return (
    <IronBankTransaction
      transactionLabel="Supply"
      transactionCompleted={txCompleted}
      transactionCompletedLabel="Exit"
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      assetHeader="To Iron Bank"
      assetLabel="Wallet Balance"
      asset={asset}
      amount={amount}
      amountValue={amountValue}
      onAmountChange={setAmount}
      borrowBalance={borrowBalance}
      borrowLimit={borrowLimit}
      projectedBorrowLimit={projectedBorrowLimit}
      yieldType={'SUPPLY'}
      actions={txActions}
      status={{ error }}
      onClose={onClose}
    />
  );
};
