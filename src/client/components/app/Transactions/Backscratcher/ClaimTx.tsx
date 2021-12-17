import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap, useAppTranslation } from '@hooks';
import {
  TokensSelectors,
  LabsSelectors,
  LabsActions,
  VaultsActions,
  TokensActions,
  NetworkSelectors,
  WalletSelectors,
} from '@store';
import { normalizeAmount, USDC_DECIMALS, validateNetwork } from '@utils';
import { getConfig } from '@config';

import { Transaction } from '../Transaction';

export interface BackscratcherClaimTxProps {
  onClose?: () => void;
}

export const BackscratcherClaimTx: FC<BackscratcherClaimTxProps> = ({ onClose, children, ...props }) => {
  const { t } = useAppTranslation('common');

  const { CONTRACT_ADDRESSES } = getConfig();
  const { THREECRV } = CONTRACT_ADDRESSES;
  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [txCompleted, setTxCompleted] = useState(false);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const selectedLab = useAppSelector(LabsSelectors.selectYveCrvLab);
  const tokenSelectorFilter = useAppSelector(TokensSelectors.selectToken);
  const selectedTargetToken = tokenSelectorFilter(THREECRV);
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

  if (!selectedLab) {
    return null;
  }

  const { error: networkError } = validateNetwork({
    currentNetwork,
    walletNetwork,
  });

  const sourceError = networkError;
  const targetError = actionsStatus.claimReward.error;

  const selectedLabOption = {
    address: selectedLab.address,
    symbol: selectedTargetToken.name,
    icon: selectedTargetToken.icon,
    balance: selectedLab.YIELD.userDeposited,
    balanceUsdc: selectedLab.YIELD.userDepositedUsdc,
    decimals: selectedTargetToken.decimals,
  };

  const amount = normalizeAmount(selectedLab.YIELD.userDeposited, selectedTargetToken.decimals);
  const amountValue = normalizeAmount(selectedLab.YIELD.userDepositedUsdc, USDC_DECIMALS);
  const expectedAmount = amount;
  const expectedAmountValue = amountValue;

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const claim = async () => {
    try {
      await dispatchAndUnwrap(LabsActions.yveCrv.yveCrvClaimReward());
      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: t('components.transaction.claim'),
      onAction: claim,
      status: actionsStatus.claimReward,
      disabled: false,
    },
  ];

  return (
    <Transaction
      transactionLabel={t('components.transaction.claim')}
      transactionCompleted={txCompleted}
      transactionCompletedLabel={t('components.transaction.status.exit')}
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader={t('components.transaction.reward')}
      sourceAssetOptions={[selectedLabOption]}
      selectedSourceAsset={selectedLabOption}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      targetHeader={t('components.transaction.to-wallet')}
      targetAssetOptions={[selectedTargetToken]}
      selectedTargetAsset={selectedTargetToken}
      targetAmount={expectedAmount}
      targetAmountValue={expectedAmountValue}
      targetStatus={{ error: targetError }}
      actions={txActions}
      sourceStatus={{ error: sourceError }}
      onClose={onClose}
    />
  );
};
