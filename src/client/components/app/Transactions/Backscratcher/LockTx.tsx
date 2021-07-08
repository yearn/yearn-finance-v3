import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap } from '@hooks';
import { VaultsSelectors, TokensActions, LabsSelectors, LabsActions } from '@store';
import { toBN, normalizeAmount, USDC_DECIMALS, validateVaultDeposit, validateVaultAllowance } from '@src/utils';

import { Transaction } from '../Transaction';

export interface BackscratcherLockTxProps {
  onClose?: () => void;
}

export const BackscratcherLockTx: FC<BackscratcherLockTxProps> = ({ onClose, children, ...props }) => {
  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [amount, setAmount] = useState('');
  const [txCompleted, setTxCompleted] = useState(false);
  const selectedLab = useAppSelector(LabsSelectors.selectYveCrvLab);
  const actionsStatus = useAppSelector(VaultsSelectors.selectSelectedVaultActionsStatusMap); // TODO: REPLACE WITH LAB SELECTOR
  const selectedSellTokenAddress = selectedLab?.token.address;
  const selectedSellToken = selectedLab?.token;

  useEffect(() => {
    if (!selectedLab || !selectedSellTokenAddress) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedSellTokenAddress,
        spenderAddress: selectedLab.address,
      })
    );
  }, [selectedSellTokenAddress]);

  if (!selectedLab || !selectedSellTokenAddress || !selectedSellToken) {
    return null;
  }

  // TODO: REPLACE WITH LAB VALIDATIONS
  const { approved: isApproved, error: allowanceError } = validateVaultAllowance({
    amount: toBN(amount),
    vaultAddress: selectedLab.address,
    vaultUnderlyingTokenAddress: selectedLab.token.address,
    sellTokenAddress: selectedSellTokenAddress,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    sellTokenAllowancesMap: selectedSellToken.allowancesMap,
  });

  const { approved: isValidAmount, error: inputError } = validateVaultDeposit({
    sellTokenAmount: toBN(amount),
    depositLimit: '0',
    emergencyShutdown: false,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    userTokenBalance: selectedSellToken.balance,
    vaultUnderlyingBalance: selectedLab.labBalance,
  });

  // TODO: NEED A CLEAR ERROR ACTION ON MODAL UNMOUNT
  const error = allowanceError || inputError || actionsStatus.approve.error || actionsStatus.deposit.error;

  const selectedLabOption = {
    address: selectedLab.address,
    symbol: selectedLab.name,
    icon: selectedLab.icon,
    balance: selectedLab.DEPOSIT.userDeposited,
    decimals: selectedLab.token.decimals,
  };
  const amountValue = toBN(amount).times(normalizeAmount(selectedSellToken.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = amount;
  const expectedAmountValue = amountValue;

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const approve = async () => {
    await dispatch(
      LabsActions.yveCrv.yveCrvApproveDeposit({
        labAddress: selectedLab.address,
        tokenAddress: selectedSellToken.address,
      })
    );
  };

  const lock = async () => {
    try {
      await dispatchAndUnwrap(
        LabsActions.yveCrv.yveCrvDeposit({
          labAddress: selectedLab.address,
          sellTokenAddress: selectedSellToken.address,
          amount: toBN(amount),
        })
      );
      setTxCompleted(true);
    } catch (error) {
      console.log(error);
    }
  };

  const txActions = [
    {
      label: 'Approve',
      onAction: approve,
      status: actionsStatus.approve,
      disabled: isApproved,
    },
    {
      label: 'Lock',
      onAction: lock,
      status: actionsStatus.deposit,
      disabled: !isApproved || !isValidAmount,
    },
  ];

  return (
    <Transaction
      transactionLabel="Lock"
      transactionCompleted={txCompleted}
      transactionCompletedLabel="Exit"
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader="From wallet"
      sourceAssetOptions={[selectedSellToken]}
      selectedSourceAsset={selectedSellToken}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      onSourceAmountChange={setAmount}
      targetHeader="To vault"
      targetAssetOptions={[selectedLabOption]}
      selectedTargetAsset={selectedLabOption}
      targetAmount={expectedAmount}
      targetAmountValue={expectedAmountValue}
      targetAmountStatus={{}}
      actions={txActions}
      status={{ error }}
    />
  );
};
