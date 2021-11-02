import { FC, useState, useEffect } from 'react';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap, useDebounce, useAppTranslation } from '@hooks';
import {
  TokensSelectors,
  VaultsSelectors,
  VaultsActions,
  TokensActions,
  SettingsSelectors,
  NetworkSelectors,
} from '@store';
import {
  toBN,
  normalizeAmount,
  USDC_DECIMALS,
  validateVaultWithdraw,
  validateVaultWithdrawAllowance,
  validateSlippage,
  calculateSharesAmount,
} from '@utils';
import { getConfig } from '@config';

import { Transaction } from './Transaction';

export interface WithdrawTxProps {
  header?: string;
  onClose?: () => void;
}

export const WithdrawTx: FC<WithdrawTxProps> = ({ header, onClose, children, ...props }) => {
  const { t } = useAppTranslation('common');

  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const { CONTRACT_ADDRESSES, NETWORK_SETTINGS } = getConfig();
  const [amount, setAmount] = useState('');
  const [debouncedAmount, isDebouncePending] = useDebounce(amount, 500);
  const [txCompleted, setTxCompleted] = useState(false);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  let zapOutTokens = useAppSelector(TokensSelectors.selectZapOutTokens);
  zapOutTokens = selectedVault?.allowZapOut ? zapOutTokens : [];
  const [selectedTargetTokenAddress, setSelectedTargetTokenAddress] = useState(
    selectedVault?.defaultDisplayToken ?? ''
  );
  const selectedSlippage = useAppSelector(SettingsSelectors.selectDefaultSlippage);
  const targetTokensOptions = selectedVault
    ? [selectedVault.token, ...zapOutTokens.filter(({ address }) => address !== selectedVault.token.address)]
    : zapOutTokens;
  const targetTokensOptionsMap = keyBy(targetTokensOptions, 'address');
  const selectedTargetToken = targetTokensOptionsMap[selectedTargetTokenAddress];
  const expectedTxOutcome = useAppSelector(VaultsSelectors.selectExpectedTxOutcome);
  const expectedTxOutcomeStatus = useAppSelector(VaultsSelectors.selectExpectedTxOutcomeStatus);
  const actionsStatus = useAppSelector(VaultsSelectors.selectSelectedVaultActionsStatusMap);

  // TODO Fix logic for vault details
  const yvTokenAmount = selectedVault
    ? calculateSharesAmount({
        amount: toBN(debouncedAmount),
        decimals: selectedVault!.decimals,
        pricePerShare: selectedVault!.pricePerShare,
      })
    : '';
  const yvTokenAmountNormalized = normalizeAmount(yvTokenAmount, toBN(selectedVault?.decimals).toNumber());

  const onExit = () => {
    dispatch(VaultsActions.clearSelectedVaultAndStatus());
    dispatch(VaultsActions.clearTransactionData());
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: undefined }));
  };

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
  }, [selectedVault?.address, CONTRACT_ADDRESSES?.zapOut]);

  useEffect(() => {
    if (!selectedVault) return;
    dispatch(VaultsActions.clearVaultStatus({ vaultAddress: selectedVault.address }));
  }, [debouncedAmount, selectedTargetTokenAddress, selectedVault]);

  useEffect(() => {
    if (!selectedVault || !selectedTargetTokenAddress) return;
    if (toBN(debouncedAmount).gt(0) && !inputError) {
      dispatch(
        VaultsActions.getExpectedTransactionOutcome({
          transactionType: 'WITHDRAW',
          sourceTokenAddress: selectedVault.address,
          sourceTokenAmount: yvTokenAmount,
          targetTokenAddress: selectedTargetTokenAddress,
        })
      );
    }
  }, [debouncedAmount]);

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

  const { error: slippageError } = validateSlippage({
    slippageTolerance: selectedSlippage,
    expectedSlippage: expectedTxOutcome?.slippage,
  });

  const selectedVaultOption = {
    address: selectedVault.address,
    symbol: selectedVault.displayName,
    icon: selectedVault.displayIcon,
    balance: selectedVault.DEPOSIT.userDeposited,
    balanceUsdc: selectedVault.DEPOSIT.userDepositedUsdc,
    decimals: selectedVault.token.decimals,
  };
  const amountValue = toBN(amount).times(normalizeAmount(selectedVault.token.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = toBN(debouncedAmount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetTokenAmount, selectedTargetToken?.decimals)
    : '';
  const expectedAmountValue = toBN(debouncedAmount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetTokenAmountUsdc, USDC_DECIMALS)
    : '0';

  const sourceError = allowanceError || inputError;
  const targetStatus = {
    error:
      expectedTxOutcomeStatus.error ||
      actionsStatus.approveZapOut.error ||
      actionsStatus.withdraw.error ||
      slippageError,
    loading: expectedTxOutcomeStatus.loading || isDebouncePending,
  };

  const loadingText = currentNetworkSettings.simulationsEnabled
    ? t('components.transaction.status.simulating')
    : t('components.transaction.status.calculating');

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
          slippageTolerance: selectedSlippage,
        })
      );
      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: t('components.transaction.approve'),
      onAction: approve,
      status: actionsStatus.approveZapOut,
      disabled: isApproved,
    },
    {
      label: t('components.transaction.withdraw'),
      onAction: withdraw,
      status: actionsStatus.withdraw,
      disabled: !isApproved || !isValidAmount || expectedTxOutcomeStatus.loading || selectedVault.withdrawalsDisabled,
      contrast: true,
    },
  ];

  return (
    <Transaction
      transactionLabel={header}
      transactionCompleted={txCompleted}
      transactionCompletedLabel={t('components.transaction.status.exit')}
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader={t('components.transaction.from-vault')}
      sourceAssetOptions={[selectedVaultOption]}
      selectedSourceAsset={selectedVaultOption}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      onSourceAmountChange={setAmount}
      targetHeader={t('components.transaction.to-wallet')}
      targetAssetOptions={targetTokensOptions}
      selectedTargetAsset={selectedTargetToken}
      onSelectedTargetAssetChange={onSelectedTargetTokenChange}
      targetAmount={expectedAmount}
      targetAmountValue={expectedAmountValue}
      targetStatus={targetStatus}
      actions={txActions}
      sourceStatus={{ error: sourceError }}
      loadingText={loadingText}
      onClose={onClose}
    />
  );
};
