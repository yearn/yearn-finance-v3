import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap } from '@hooks';
import { IronBankSelectors, IronBankActions } from '@store';
import { toBN, normalizeAmount, normalizePercent, USDC_DECIMALS, basicValidateAmount, toWei } from '@src/utils';
import { getConfig } from '@config';

import { IronBankTransaction } from '../IronBankTransaction';

export interface IronBankWithdrawTxProps {
  onClose?: () => void;
}

export const IronBankWithdrawTx: FC<IronBankWithdrawTxProps> = ({ onClose }) => {
  const { IRON_BANK_MAX_RATIO } = getConfig();
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

  if (!selectedMarket || !userIronBankSummary || !selectedToken) {
    return null;
  }

  const borrowBalance = normalizeAmount(userIronBankSummary.borrowBalanceUsdc, USDC_DECIMALS);
  const underlyingTokenPrice = normalizeAmount(selectedToken.priceUsdc, USDC_DECIMALS);
  const amountValue = toBN(amount).times(underlyingTokenPrice).toString();
  const collateralFactor = normalizeAmount(selectedMarket.collateralFactor, selectedToken.decimals);
  const collateralAmount = toBN(amountValue).times(collateralFactor).toString();
  const borrowLimit = normalizeAmount(userIronBankSummary.borrowLimitUsdc, USDC_DECIMALS);

  const proyectedBorrowLimit = toBN(borrowLimit).minus(collateralAmount).toString();
  const maxAllowedBorrowBalance = toBN(borrowBalance).div(IRON_BANK_MAX_RATIO).toString();
  const suppliedTokens = normalizeAmount(selectedMarket.LEND.userDeposited, selectedToken.decimals);
  const availableCollateral = toBN(borrowLimit).minus(maxAllowedBorrowBalance).toString();
  let withdrawableTokens = toBN(availableCollateral).div(collateralFactor).div(underlyingTokenPrice).toString();
  withdrawableTokens = toBN(withdrawableTokens).lt(0) ? '0' : withdrawableTokens;
  withdrawableTokens = toBN(withdrawableTokens).gt(suppliedTokens) ? suppliedTokens : withdrawableTokens;
  const asset = {
    ...selectedToken,
    balance: selectedMarket.LEND.userDeposited,
    yield: normalizePercent(selectedMarket.lendApy, 2),
  };

  const { approved: isValidAmount, error: inputError } = basicValidateAmount({
    sellTokenAmount: toBN(amount),
    sellTokenDecimals: selectedToken.decimals.toString(),
    totalAmountAvailable: toWei(withdrawableTokens, selectedToken.decimals),
  });

  const error = inputError || actionsStatus.withdraw.error;

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const withdraw = async () => {
    try {
      await dispatchAndUnwrap(
        IronBankActions.withdrawMarket({
          marketAddress: selectedMarket.address,
          amount: toBN(amount),
        })
      );
      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: 'Withdraw',
      onAction: withdraw,
      status: actionsStatus.withdraw,
      disabled: !isValidAmount,
      contrast: true,
    },
  ];

  return (
    <IronBankTransaction
      transactionLabel="Withdraw"
      transactionCompleted={txCompleted}
      transactionCompletedLabel="Exit"
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      assetHeader="From Iron Bank"
      asset={asset}
      amount={amount}
      amountValue={amountValue}
      safeMax={withdrawableTokens}
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
