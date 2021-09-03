import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap, useDebounce } from '@hooks';
import { IronBankSelectors, IronBankActions } from '@store';
import {
  toBN,
  normalizeAmount,
  normalizePercent,
  USDC_DECIMALS,
  basicValidateAmount,
  toWei,
  COLLATERAL_FACTOR_DECIMALS,
} from '@src/utils';
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
    if (selectedMarket) {
      dispatch(IronBankActions.getUserMarketsPositions({ marketAddresses: [selectedMarket.address] }));
      // dispatch(IronBankActions.getUserMarketsMetadata({ marketAddresses: [selectedMarket.address] })); TODO use this when lens fixes are deployed
      dispatch(IronBankActions.getUserMarketsMetadata({})); //  TODO remove this when lens fixes are deployed
    }

    return () => {
      onExit();
    };
  }, []);

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
  const collateralFactor = normalizeAmount(selectedMarket.collateralFactor, COLLATERAL_FACTOR_DECIMALS);
  const collateralAmount = toBN(amountValue).times(collateralFactor).toString();
  const borrowLimit = normalizeAmount(userIronBankSummary.borrowLimitUsdc, USDC_DECIMALS);

  const projectedBorrowLimit = toBN(borrowLimit).minus(collateralAmount).toString();
  const maxAllowedBorrowBalance = toBN(borrowBalance).div(IRON_BANK_MAX_RATIO).toString();
  const suppliedTokens = normalizeAmount(selectedMarket.LEND.userDeposited, selectedToken.decimals);
  const availableCollateral = toBN(borrowLimit).minus(maxAllowedBorrowBalance).toString();
  let withdrawableTokens = toBN(availableCollateral).div(collateralFactor).div(underlyingTokenPrice).toString();
  withdrawableTokens = toBN(withdrawableTokens).lt(0) ? '0' : withdrawableTokens;
  withdrawableTokens = toBN(withdrawableTokens).gt(suppliedTokens) ? suppliedTokens : withdrawableTokens;
  withdrawableTokens = toBN(withdrawableTokens).toFixed(selectedToken.decimals);
  const asset = {
    ...selectedToken,
    balance: selectedMarket.LEND.userDeposited,
    balanceUsdc: selectedMarket.LEND.userDepositedUsdc,
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
      assetLabel="Supplied Balance"
      asset={asset}
      amount={amount}
      amountValue={amountValue}
      safeMax={withdrawableTokens}
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
