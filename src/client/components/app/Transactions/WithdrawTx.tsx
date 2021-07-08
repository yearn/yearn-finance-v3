import { FC, useState, useEffect } from 'react';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap } from '@hooks';
import { TokensSelectors, VaultsSelectors, VaultsActions, TokensActions } from '@store';
import {
  toBN,
  formatPercent,
  normalizeAmount,
  USDC_DECIMALS,
  validateVaultWithdraw,
  validateVaultWithdrawAllowance,
  calculateSharesAmount,
} from '@src/utils';
import { getConfig } from '@config';

import { Transaction } from './Transaction';
export interface WithdrawTxProps {
  onClose?: () => void;
}

export const WithdrawTx: FC<WithdrawTxProps> = ({ onClose, children, ...props }) => {
  const { SLIPPAGE_OPTIONS, CONTRACT_ADDRESSES } = getConfig();
  const slippageOptions = SLIPPAGE_OPTIONS.map((value) => ({
    value: value.toString(),
    label: formatPercent(value.toString(), 0),
  }));
  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [amount, setAmount] = useState('');
  const [txCompleted, setTxCompleted] = useState(false);
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const zapOutTokens = useAppSelector(TokensSelectors.selectZapOutTokens);
  const [selectedTargetTokenAddress, setSelectedTargetTokenAddress] = useState(selectedVault?.token.address ?? '');
  const [selectedSlippage, setSelectedSlippage] = useState(slippageOptions[0]);
  const targetTokensOptions = selectedVault
    ? [selectedVault.token, ...zapOutTokens.filter(({ address }) => address !== selectedVault.token.address)]
    : zapOutTokens;
  const targetTokensOptionsMap = keyBy(targetTokensOptions, 'address');
  const selectedTargetToken = targetTokensOptionsMap[selectedTargetTokenAddress];
  const expectedTxOutcome = useAppSelector(VaultsSelectors.selectExpectedTxOutcome);
  const expectedTxOutcomeStatus = useAppSelector(VaultsSelectors.selectExpectedTxOutcomeStatus);
  const actionsStatus = useAppSelector(VaultsSelectors.selectSelectedVaultActionsStatusMap);

  const yvTokenAmount = calculateSharesAmount({
    amount: toBN(amount),
    decimals: selectedVault!.decimals,
    pricePerShare: selectedVault!.pricePerShare,
  });
  const yvTokenAmountNormalized = normalizeAmount(yvTokenAmount, toBN(selectedVault?.decimals).toNumber());

  useEffect(() => {
    return () => {
      onExit();
    };
  }, []);

  useEffect(() => {
    if (!selectedVault) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedVault.address,
        spenderAddress: CONTRACT_ADDRESSES.zapOut,
      })
    );
  }, [selectedTargetTokenAddress]);

  useEffect(() => {
    if (!selectedVault || !selectedTargetTokenAddress) return;

    if (toBN(amount).gt(0)) {
      dispatch(
        VaultsActions.getExpectedTransactionOutcome({
          transactionType: 'WITHDRAW',
          sourceTokenAddress: selectedVault.address,
          sourceTokenAmount: yvTokenAmount,
          targetTokenAddress: selectedTargetTokenAddress,
        })
      );
    }
  }, [amount, selectedTargetTokenAddress, selectedVault]);

  if (!selectedVault || !selectedTargetToken || !targetTokensOptions) {
    return null;
  }

  const { approved: isApproved, error: allowanceError } = validateVaultWithdrawAllowance({
    yvTokenAddress: selectedVault.address,
    yvTokenAmount: toBN(yvTokenAmountNormalized),
    yvTokenDecimals: selectedVault.decimals,
    underlyingTokenAddress: selectedVault.token.address,
    targetTokenAddress: selectedTargetTokenAddress,
    yvTokenAllowancesMap: selectedVault.allowancesMap,
  });

  const { approved: isValidAmount, error: inputError } = validateVaultWithdraw({
    yvTokenAmount: toBN(yvTokenAmountNormalized),
    yvTokenDecimals: selectedVault.decimals,
    userYvTokenBalance: selectedVault.DEPOSIT.userBalance,
  });

  // TODO: NEED A CLEAR ERROR ACTION ON MODAL UNMOUNT
  const error = allowanceError || inputError || actionsStatus.approveZapOut.error || actionsStatus.withdraw.error;

  const selectedVaultOption = {
    address: selectedVault.address,
    symbol: selectedVault.token.name,
    icon: selectedVault.token.icon,
    balance: selectedVault.DEPOSIT.userDeposited,
    decimals: selectedVault.token.decimals,
  };
  const amountValue = toBN(amount).times(normalizeAmount(selectedVault.token.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = toBN(amount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetUnderlyingTokenAmount, selectedVault?.token.decimals)
    : '';
  const expectedAmountValue = toBN(expectedAmount)
    .times(normalizeAmount(selectedVault.token.priceUsdc, USDC_DECIMALS))
    .toString();

  const onSelectedTargetTokenChange = (tokenAddress: string) => {
    setAmount('');
    setSelectedTargetTokenAddress(tokenAddress);
  };

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const approve = async () => {
    await dispatch(VaultsActions.approveZapOut({ vaultAddress: selectedVault.address }));
  };

  const withdraw = async () => {
    try {
      await dispatchAndUnwrap(
        VaultsActions.withdrawVault({
          vaultAddress: selectedVault.address,
          amount: toBN(amount),
          targetTokenAddress: selectedTargetTokenAddress,
          slippageTolerance: toBN(selectedSlippage.value).toNumber(),
        })
      );
      setTxCompleted(true);
    } catch (error) {}
  };

  const onExit = () => {
    dispatch(VaultsActions.clearSelectedVaultAndStatus());
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: undefined }));
  };

  const txActions = [
    {
      label: 'Approve',
      onAction: approve,
      status: actionsStatus.approveZapOut,
      disabled: isApproved,
    },
    {
      label: 'Withdraw',
      onAction: withdraw,
      status: actionsStatus.withdraw,
      disabled: !isApproved || !isValidAmount,
    },
  ];

  return (
    <Transaction
      transactionLabel="Withdraw"
      transactionCompleted={txCompleted}
      transactionCompletedLabel="Exit"
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader="From vault"
      sourceAssetOptions={[selectedVaultOption]}
      selectedSourceAsset={selectedVaultOption}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      onSourceAmountChange={setAmount}
      targetHeader="To wallet"
      targetAssetOptions={targetTokensOptions}
      selectedTargetAsset={selectedTargetToken}
      onSelectedTargetAssetChange={onSelectedTargetTokenChange}
      targetAmount={expectedAmount}
      targetAmountValue={expectedAmountValue}
      targetAmountStatus={expectedTxOutcomeStatus}
      actions={txActions}
      status={{ error }}
      onClose={onClose}
    />
  );
};
