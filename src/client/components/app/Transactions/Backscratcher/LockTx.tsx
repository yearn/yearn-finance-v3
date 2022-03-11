import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap, useDebounce, useAppTranslation } from '@hooks';
import { TokensActions, LabsSelectors, LabsActions, VaultsActions, NetworkSelectors, WalletSelectors } from '@store';
import {
  toBN,
  normalizeAmount,
  USDC_DECIMALS,
  validateVaultDeposit,
  formatPercent,
  validateYveCrvActionsAllowance,
  validateNetwork,
} from '@utils';

import { Transaction } from '../Transaction';

export interface BackscratcherLockTxProps {
  onClose?: () => void;
}

export const BackscratcherLockTx: FC<BackscratcherLockTxProps> = ({ onClose, children, ...props }) => {
  const { t } = useAppTranslation('common');

  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [amount, setAmount] = useState('');
  const [debouncedAmount] = useDebounce(amount, 500);
  const [txCompleted, setTxCompleted] = useState(false);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const selectedLab = useAppSelector(LabsSelectors.selectYveCrvLab);
  const actionsStatus = useAppSelector(LabsSelectors.selectSelectedLabActionsStatusMap);
  const selectedSellTokenAddress = selectedLab?.token.address;
  const selectedSellToken = selectedLab?.token;

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
    if (!selectedLab || !selectedSellTokenAddress) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedSellTokenAddress,
        spenderAddress: selectedLab.address,
      })
    );
  }, [selectedSellTokenAddress, selectedLab?.address]);

  useEffect(() => {
    if (!selectedLab) return;
    dispatch(LabsActions.clearLabStatus({ labAddress: selectedLab.address }));
  }, [debouncedAmount]);

  if (!selectedLab || !selectedSellTokenAddress || !selectedSellToken) {
    return null;
  }

  // TODO: generic lab allowance validation
  const { approved: isApproved, error: allowanceError } = validateYveCrvActionsAllowance({
    action: 'LOCK',
    labAddress: selectedLab.address,
    sellTokenAmount: toBN(amount),
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
    targetUnderlyingTokenAmount: amount,
  });

  const { error: networkError } = validateNetwork({
    currentNetwork,
    walletNetwork,
  });

  const sourceError = networkError || allowanceError || inputError;
  const targetError = actionsStatus.approveDeposit.error || actionsStatus.deposit.error;

  const selectedLabOption = {
    address: selectedLab.address,
    symbol: selectedLab.displayName,
    icon: selectedLab.displayIcon,
    balance: selectedLab.DEPOSIT.userDeposited,
    balanceUsdc: selectedLab.DEPOSIT.userDepositedUsdc,
    decimals: selectedLab.token.decimals,
    yield: formatPercent(selectedLab.apyData, 2),
  };
  const amountValue = toBN(amount).times(normalizeAmount(selectedSellToken.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = amount;
  const expectedAmountValue = amountValue;

  // NOTE If component is added to vault details, update this function to reflect logic from depositTx
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
          tokenAddress: selectedSellToken.address,
          amount: toBN(amount),
          targetUnderlyingTokenAmount: amount,
        })
      );
      setTxCompleted(true);
    } catch (error) {
      console.log(error);
    }
  };

  const txActions = [
    {
      label: t('components.transaction.approve'),
      onAction: approve,
      status: actionsStatus.approveDeposit,
      disabled: isApproved,
    },
    {
      label: t('components.transaction.lock'),
      onAction: lock,
      status: actionsStatus.deposit,
      disabled: !isApproved || !isValidAmount,
      contrast: true,
    },
  ];

  return (
    <Transaction
      transactionLabel={t('components.transaction.lock')}
      transactionCompleted={txCompleted}
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader={t('components.transaction.from-wallet')}
      sourceAssetOptions={[selectedSellToken]}
      selectedSourceAsset={selectedSellToken}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      onSourceAmountChange={setAmount}
      targetHeader={t('components.transaction.to-vault')}
      targetAssetOptions={[selectedLabOption]}
      selectedTargetAsset={selectedLabOption}
      targetAmount={expectedAmount}
      targetAmountValue={expectedAmountValue}
      targetStatus={{ error: targetError }}
      actions={txActions}
      sourceStatus={{ error: sourceError }}
    />
  );
};
