import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap } from '@hooks';
import { VaultsSelectors, LabsSelectors, LabsActions, VaultsActions, TokensActions } from '@store';
import { normalizeAmount, USDC_DECIMALS } from '@src/utils';
import { getConfig } from '@config';

import { Transaction } from '../Transaction';

export interface BackscratcherReinvestTxProps {
  onClose?: () => void;
}

export const BackscratcherReinvestTx: FC<BackscratcherReinvestTxProps> = ({ onClose, children, ...props }) => {
  const { CONTRACT_ADDRESSES } = getConfig();
  const { YVTHREECRV, y3CrvBackZapper } = CONTRACT_ADDRESSES;
  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [txCompleted, setTxCompleted] = useState(false);
  const selectedLab = useAppSelector(LabsSelectors.selectYveCrvLab);
  const vaultSelectorFilter = useAppSelector(VaultsSelectors.selectVault);
  const selectedTargetVault = vaultSelectorFilter(YVTHREECRV);
  const selectedTargetToken = selectedTargetVault?.token;
  const actionsStatus = useAppSelector(LabsSelectors.selectSelectedLabActionsStatusMap);

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
    if (!selectedTargetToken) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedTargetToken.address,
        spenderAddress: y3CrvBackZapper,
      })
    );
  }, []);

  if (!selectedLab || !selectedTargetVault || !selectedTargetToken) {
    return null;
  }

  // TODO: VALIDATIONS
  const error = actionsStatus.approveReinvest.error || actionsStatus.reinvest.error;

  const selectedLabOption = {
    address: selectedLab.address,
    symbol: selectedTargetToken.name,
    icon: selectedTargetToken.icon,
    balance: selectedTargetVault.DEPOSIT.userDeposited,
    decimals: selectedTargetToken.decimals,
    yield: selectedTargetVault.apyData,
  };

  const amount = normalizeAmount(selectedLab.YIELD.userDeposited, selectedTargetToken.decimals);
  const amountValue = normalizeAmount(selectedLab.YIELD.userDepositedUsdc, USDC_DECIMALS);
  const expectedAmount = amount;
  const expectedAmountValue = amountValue;

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const approve = async () => {
    await dispatch(
      LabsActions.yveCrv.yveCrvApproveReinvest({
        labAddress: selectedLab.address,
        tokenAddress: selectedTargetToken.address,
      })
    );
  };

  const reinvest = async () => {
    try {
      await dispatchAndUnwrap(LabsActions.yveCrv.yveCrvReinvest());
      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: 'Approve',
      onAction: approve,
      status: actionsStatus.approveReinvest,
      disabled: false,
    },
    {
      label: 'Reinvest',
      onAction: reinvest,
      status: actionsStatus.reinvest,
      disabled: false,
    },
  ];

  return (
    <Transaction
      transactionLabel="Reinvest"
      transactionCompleted={txCompleted}
      transactionCompletedLabel="Exit"
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader="Reward"
      sourceAssetOptions={[selectedLabOption]}
      selectedSourceAsset={selectedLabOption}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      targetHeader="To Vault"
      targetAssetOptions={[selectedTargetToken]}
      selectedTargetAsset={selectedTargetToken}
      targetAmount={expectedAmount}
      targetAmountValue={expectedAmountValue}
      targetAmountStatus={{}}
      actions={txActions}
      status={{ error }}
      onClose={onClose}
    />
  );
};
