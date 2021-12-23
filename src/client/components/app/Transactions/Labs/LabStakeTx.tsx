import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap, useDebounce, useAppTranslation } from '@hooks';
import {
  TokensSelectors,
  LabsSelectors,
  LabsActions,
  TokensActions,
  VaultsActions,
  NetworkSelectors,
  WalletSelectors,
} from '@store';
import {
  toBN,
  normalizeAmount,
  USDC_DECIMALS,
  validateNetwork,
  validateVaultDeposit,
  validateYvBoostEthActionsAllowance,
  getStakingContractAddress,
  formatPercent,
} from '@utils';

import { Transaction } from '../Transaction';

export interface LabStakeTxProps {
  onClose?: () => void;
}

export const LabStakeTx: FC<LabStakeTxProps> = ({ onClose, children, ...props }) => {
  const { t } = useAppTranslation('common');

  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [amount, setAmount] = useState('');
  const [txCompleted, setTxCompleted] = useState(false);
  const [debouncedAmount] = useDebounce(amount, 500);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const selectedLab = useAppSelector(LabsSelectors.selectSelectedLab);
  const tokenSelectorFilter = useAppSelector(TokensSelectors.selectToken);
  const selectedSellToken = tokenSelectorFilter(selectedLab?.address ?? '');
  selectedSellToken.balance = selectedLab?.DEPOSIT.userBalance ?? '0';
  selectedSellToken.balanceUsdc = selectedLab?.DEPOSIT.userDepositedUsdc ?? '0';
  const selectedSellTokenAddress = selectedSellToken.address;
  const sellTokensOptions = [selectedSellToken];
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
    if (!selectedLab || !selectedSellTokenAddress) return;

    const spenderAddress = getStakingContractAddress(selectedLab.address);
    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedSellTokenAddress,
        spenderAddress,
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

  // TODO: USE LAB GENERAL VALIDATIONS
  const { approved: isApproved, error: allowanceError } = validateYvBoostEthActionsAllowance({
    sellTokenAmount: toBN(amount),
    sellTokenAddress: selectedSellTokenAddress,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    sellTokenAllowancesMap: selectedSellToken.allowancesMap,
    action: 'STAKE',
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
    balance: selectedLab.STAKE.userDeposited,
    balanceUsdc: selectedLab.STAKE.userDepositedUsdc,
    decimals: toBN(selectedLab.decimals).toNumber(),
    yield: formatPercent(selectedLab.apyData, 2),
  };

  const amountValue = toBN(amount).times(normalizeAmount(selectedSellToken.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = amount;
  const expectedAmountValue = amountValue;

  const onSelectedSellTokenChange = (tokenAddress: string) => {
    setAmount('');
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress }));
  };

  const onSelectedLabChange = (labAddress: string) => {
    setAmount('');
    dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
  };

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const approve = async () => {
    await dispatch(
      LabsActions.yvBoostEth.yvBoostEthApproveStake({
        labAddress: selectedLab.address,
      })
    );
  };

  const deposit = async () => {
    try {
      await dispatchAndUnwrap(
        LabsActions.yvBoostEth.yvBoostEthStake({
          labAddress: selectedLab.address,
          tokenAddress: selectedSellToken.address,
          amount: toBN(amount),
          targetUnderlyingTokenAmount: amount,
        })
      );
      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: t('components.transaction.approve'),
      onAction: approve,
      status: actionsStatus.approveStake,
      disabled: isApproved,
    },
    {
      label: t('components.transaction.deposit'),
      onAction: deposit,
      status: actionsStatus.stake,
      disabled: !isApproved || !isValidAmount,
      contrast: true,
    },
  ];

  return (
    <Transaction
      transactionLabel={t('components.transaction.stake')}
      transactionCompleted={txCompleted}
      transactionCompletedLabel={t('components.transaction.status.exit')}
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader={t('components.transaction.from-wallet')}
      sourceAssetOptions={sellTokensOptions}
      selectedSourceAsset={selectedSellToken}
      onSelectedSourceAssetChange={onSelectedSellTokenChange}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      onSourceAmountChange={setAmount}
      targetHeader={t('components.transaction.to-gauge')}
      targetAssetOptions={[selectedLabOption]}
      selectedTargetAsset={selectedLabOption}
      onSelectedTargetAssetChange={onSelectedLabChange}
      targetAmount={expectedAmount}
      targetAmountValue={expectedAmountValue}
      targetStatus={{ error: targetError }}
      actions={txActions}
      sourceStatus={{ error: sourceError }}
      onClose={onClose}
    />
  );
};
