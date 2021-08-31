import { FC, useState, useEffect } from 'react';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap, useDebounce } from '@hooks';
import {
  TokensSelectors,
  LabsSelectors,
  LabsActions,
  VaultsSelectors,
  VaultsActions,
  TokensActions,
  SettingsSelectors,
} from '@store';
import {
  toBN,
  normalizeAmount,
  USDC_DECIMALS,
  validateVaultWithdraw,
  validateVaultWithdrawAllowance,
  calculateSharesAmount,
} from '@src/utils';
import { getConfig } from '@config';

import { Transaction } from '../Transaction';
export interface LabWithdrawTxProps {
  onClose?: () => void;
}

export const LabWithdrawTx: FC<LabWithdrawTxProps> = ({ onClose, children, ...props }) => {
  const { CONTRACT_ADDRESSES } = getConfig();
  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [amount, setAmount] = useState('');
  const [debouncedAmount, isDebouncePending] = useDebounce(amount, 500);
  const [txCompleted, setTxCompleted] = useState(false);
  const selectedLab = useAppSelector(LabsSelectors.selectSelectedLab);
  const tokenSelectorFilter = useAppSelector(TokensSelectors.selectToken);
  const selectedLabToken = tokenSelectorFilter(selectedLab?.address ?? '');
  const zapOutTokens = useAppSelector(TokensSelectors.selectZapOutTokens);
  const [selectedTargetTokenAddress, setSelectedTargetTokenAddress] = useState(selectedLab?.defaultDisplayToken ?? '');
  const selectedSlippage = useAppSelector(SettingsSelectors.selectDefaultSlippage).toString();

  const targetTokensOptions = selectedLab
    ? [selectedLab.token, ...zapOutTokens.filter(({ address }) => address !== selectedLab.token.address)]
    : zapOutTokens;
  const targetTokensOptionsMap = keyBy(targetTokensOptions, 'address');
  const selectedTargetToken = targetTokensOptionsMap[selectedTargetTokenAddress];
  const expectedTxOutcome = useAppSelector(VaultsSelectors.selectExpectedTxOutcome);
  const expectedTxOutcomeStatus = useAppSelector(VaultsSelectors.selectExpectedTxOutcomeStatus);
  const actionsStatus = useAppSelector(LabsSelectors.selectSelectedLabActionsStatusMap);

  const yvTokenAmount = calculateSharesAmount({
    amount: toBN(debouncedAmount),
    decimals: selectedLab!.decimals,
    pricePerShare: selectedLab!.pricePerShare,
  });
  const yvTokenAmountNormalized = normalizeAmount(yvTokenAmount, toBN(selectedLab?.decimals).toNumber());

  const onExit = () => {
    dispatch(LabsActions.clearSelectedLabAndStatus());
    dispatch(VaultsActions.clearTransactionData());
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: undefined }));
  };

  useEffect(() => {
    return () => {
      onExit();
    };
  }, []);

  useEffect(() => {
    if (!selectedLab) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedLab.address,
        spenderAddress: CONTRACT_ADDRESSES.zapOut,
      })
    );
  }, [selectedTargetTokenAddress]);

  useEffect(() => {
    if (!selectedLab) return;
    dispatch(LabsActions.clearLabStatus({ labAddress: selectedLab.address }));
  }, [debouncedAmount, selectedTargetTokenAddress, selectedLab]);

  useEffect(() => {
    if (!selectedLab || !selectedTargetTokenAddress) return;
    if (toBN(debouncedAmount).gt(0) && !inputError) {
      dispatch(
        VaultsActions.getExpectedTransactionOutcome({
          transactionType: 'WITHDRAW',
          sourceTokenAddress: selectedLab.address,
          sourceTokenAmount: yvTokenAmount,
          targetTokenAddress: selectedTargetTokenAddress,
        })
      );
    }
  }, [debouncedAmount]);

  if (!selectedLab || !selectedTargetToken || !targetTokensOptions) {
    return null;
  }

  // TODO: FIX WITH CORRECT LAB VALIDATIONS
  const { approved: isApproved, error: allowanceError } = validateVaultWithdrawAllowance({
    yvTokenAddress: selectedLab.address,
    yvTokenAmount: toBN(yvTokenAmountNormalized),
    yvTokenDecimals: selectedLab.decimals,
    underlyingTokenAddress: selectedLab.token.address,
    targetTokenAddress: selectedTargetTokenAddress,
    yvTokenAllowancesMap: selectedLab.allowancesMap,
  });

  const { approved: isValidAmount, error: inputError } = validateVaultWithdraw({
    yvTokenAmount: toBN(yvTokenAmountNormalized),
    yvTokenDecimals: selectedLab.decimals,
    userYvTokenBalance: selectedLab.DEPOSIT.userBalance,
  });

  // TODO: NEED A CLEAR ERROR ACTION ON MODAL UNMOUNT
  const error = allowanceError || inputError || actionsStatus.approveWithdraw.error || actionsStatus.withdraw.error;

  const selectedLabOption = {
    address: selectedLab.address,
    symbol: selectedLab.displayName,
    icon: selectedLab.displayIcon,
    balance: selectedLab.DEPOSIT.userBalance,
    decimals: toBN(selectedLab.decimals).toNumber(),
  };

  const amountValue = toBN(amount).times(normalizeAmount(selectedLabToken.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = toBN(debouncedAmount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetUnderlyingTokenAmount, selectedLab?.token.decimals)
    : '';
  const expectedAmountValue = toBN(debouncedAmount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetTokenAmountUsdc, USDC_DECIMALS)
    : '0';
  const expectedAmountStatus = {
    error: expectedTxOutcomeStatus.error,
    loading: expectedTxOutcomeStatus.loading || isDebouncePending,
  };

  const onSelectedTargetTokenChange = (tokenAddress: string) => {
    setAmount('');
    setSelectedTargetTokenAddress(tokenAddress);
  };

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const approve = async () => {
    await dispatch(LabsActions.approveWithdraw({ labAddress: selectedLab.address }));
  };

  const withdraw = async () => {
    try {
      await dispatchAndUnwrap(
        LabsActions.withdraw({
          labAddress: selectedLab.address,
          amount: toBN(amount),
          tokenAddress: selectedTargetTokenAddress,
          slippageTolerance: toBN(selectedSlippage).toNumber(),
        })
      );
      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: 'Approve',
      onAction: approve,
      status: actionsStatus.approveWithdraw,
      disabled: isApproved,
    },
    {
      label: 'Withdraw',
      onAction: withdraw,
      status: actionsStatus.withdraw,
      disabled: !isApproved || !isValidAmount || expectedTxOutcomeStatus.loading,
      contrast: true,
    },
  ];

  return (
    <Transaction
      transactionLabel="Withdraw"
      transactionCompleted={txCompleted}
      transactionCompletedLabel="Exit"
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader="From Vault"
      sourceAssetOptions={[selectedLabOption]}
      selectedSourceAsset={selectedLabOption}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      onSourceAmountChange={setAmount}
      targetHeader="To Wallet"
      targetAssetOptions={targetTokensOptions}
      selectedTargetAsset={selectedTargetToken}
      onSelectedTargetAssetChange={onSelectedTargetTokenChange}
      targetAmount={expectedAmount}
      targetAmountValue={expectedAmountValue}
      targetAmountStatus={expectedAmountStatus}
      actions={txActions}
      status={{ error }}
      onClose={onClose}
    />
  );
};
