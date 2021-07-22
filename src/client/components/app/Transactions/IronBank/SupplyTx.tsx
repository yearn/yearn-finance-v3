import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap } from '@hooks';
import { IronBankSelectors, TokensActions, IronBankActions } from '@store';
import { toBN, normalizeAmount, normalizePercent, USDC_DECIMALS } from '@src/utils';

import { IronBankTransaction } from '../IronBankTransaction';

export interface IronBankSupplyTxProps {
  onClose?: () => void;
}

export const IronBankSupplyTx: FC<IronBankSupplyTxProps> = ({ onClose, children, ...props }) => {
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

  useEffect(() => {
    if (!selectedMarket) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedMarket.token.address,
        spenderAddress: selectedMarket.address,
      })
    );
  }, [selectedMarket?.address]);

  if (!selectedMarket || !userIronBankSummary) {
    return null;
  }

  // TODO: validations
  const { approved: isApproved, error: allowanceError } = { approved: true, error: undefined };
  const { approved: isValidAmount, error: inputError } = { approved: true, error: undefined };

  const error = allowanceError || inputError || actionsStatus.approve.error || actionsStatus.supply.error;

  const amountValue = toBN(amount).times(normalizeAmount(selectedMarket.token.priceUsdc, USDC_DECIMALS)).toString();
  const collateralAmount = toBN(amountValue)
    .times(normalizeAmount(selectedMarket.collateralFactor, selectedMarket.token.decimals))
    .toString();
  const borrowLimit = normalizeAmount(userIronBankSummary.borrowLimitUsdc, USDC_DECIMALS);
  const proyectedBorrowLimit = toBN(borrowLimit).plus(collateralAmount).toString();
  const borrowBalance = normalizeAmount(userIronBankSummary.borrowBalanceUsdc, USDC_DECIMALS);
  const asset = { ...selectedMarket.token, yield: normalizePercent(selectedMarket.lendApy, 2) };

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const approve = async () => {
    await dispatch(
      IronBankActions.approveMarket({
        marketAddress: selectedMarket.address,
        tokenAddress: selectedMarket.token.address,
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
      asset={asset}
      amount={amount}
      amountValue={amountValue}
      onAmountChange={setAmount}
      borrowBalance={borrowBalance}
      borrowLimit={borrowLimit}
      proyectedBorrowLimit={proyectedBorrowLimit}
      yieldType={'SUPPLY'}
      actions={txActions}
      status={{ error }}
      onClose={onClose}
    />
  );
};
