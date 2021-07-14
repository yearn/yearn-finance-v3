import { FC, useState, useEffect } from 'react';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap } from '@hooks';
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
  formatPercent,
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
  const [txCompleted, setTxCompleted] = useState(false);
  const selectedLab = useAppSelector(LabsSelectors.selectSelectedLab);
  const tokenSelectorFilter = useAppSelector(TokensSelectors.selectToken);
  const selectedLabToken = tokenSelectorFilter(selectedLab?.address ?? '');
  const zapOutTokens = useAppSelector(TokensSelectors.selectZapOutTokens);
  const [selectedTargetTokenAddress, setSelectedTargetTokenAddress] = useState(selectedLab?.token.address ?? '');
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
    amount: toBN(amount),
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
    if (!selectedLab || !selectedTargetTokenAddress) return;

    if (toBN(amount).gt(0)) {
      dispatch(
        VaultsActions.getExpectedTransactionOutcome({
          transactionType: 'WITHDRAW',
          sourceTokenAddress: selectedLab.address,
          sourceTokenAmount: yvTokenAmount,
          targetTokenAddress: selectedTargetTokenAddress,
        })
      );
    }
  }, [amount, selectedTargetTokenAddress, selectedLab]);

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
    symbol: selectedLab.name,
    icon: selectedLab.icon,
    balance: selectedLab.DEPOSIT.userBalance,
    decimals: toBN(selectedLab.decimals).toNumber(),
  };

  const amountValue = toBN(amount).times(normalizeAmount(selectedLabToken.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = toBN(amount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetUnderlyingTokenAmount, selectedLab?.token.decimals)
    : '';
  const expectedAmountValue = toBN(expectedAmount)
    .times(normalizeAmount(selectedLab.token.priceUsdc, USDC_DECIMALS))
    .toString();

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
      targetAmountStatus={expectedTxOutcomeStatus}
      actions={txActions}
      status={{ error }}
      onClose={onClose}
    />
  );
};
