import { FC, useState, useEffect } from 'react';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap, useDebounce, useAppTranslation } from '@hooks';
import {
  VaultsSelectors,
  VaultsActions,
  TokensActions,
  SettingsSelectors,
  NetworkSelectors,
  WalletSelectors,
  AppSelectors,
  selectWithdrawTokenOptionsByAsset,
} from '@store';
import {
  toUnit,
  toBN,
  normalizeAmount,
  USDC_DECIMALS,
  validateVaultWithdraw,
  validateVaultWithdrawAllowance,
  validateSlippage,
  validateNetwork,
  calculateSharesAmount,
  calculateUnderlyingAmount,
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
  const { CONTRACT_ADDRESSES, NETWORK_SETTINGS, MAX_UINT256 } = getConfig();
  const [signature, setSignature] = useState<string | undefined>();
  const [amount, setAmount] = useState('');
  const [debouncedAmount, isDebouncePending] = useDebounce(amount, 500);
  const [txCompleted, setTxCompleted] = useState(false);
  const servicesEnabled = useAppSelector(AppSelectors.selectServicesEnabled);
  const simulationsEnabled = servicesEnabled.tenderly;
  const zapperEnabled = servicesEnabled.zapper;
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const [selectedTargetTokenAddress, setSelectedTargetTokenAddress] = useState('');
  const selectedSlippage = useAppSelector(SettingsSelectors.selectDefaultSlippage);
  const signedApprovalsEnabled = useAppSelector(SettingsSelectors.selectSignedApprovalsEnabled);
  const withdrawTokenOptionsByVault = useAppSelector(selectWithdrawTokenOptionsByAsset);
  const targetTokensOptions = withdrawTokenOptionsByVault(selectedVault?.address);
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
    if (!selectedTargetTokenAddress && selectedVault) {
      setSelectedTargetTokenAddress(
        !zapperEnabled && selectedVault.zapOutWith === 'zapperZapOut'
          ? selectedVault.token.address
          : selectedVault.defaultDisplayToken
      );
    }
  }, [selectedTargetTokenAddress, selectedVault]);

  useEffect(() => {
    if (!selectedVault || !walletIsConnected) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedVault.address,
        spenderAddress: CONTRACT_ADDRESSES.zapOut,
      })
    );
  }, [selectedVault?.address, CONTRACT_ADDRESSES?.zapOut, walletIsConnected]);

  useEffect(() => {
    if (!selectedVault) return;
    dispatch(VaultsActions.clearVaultStatus({ vaultAddress: selectedVault.address }));
  }, [debouncedAmount, selectedTargetTokenAddress, selectedVault]);

  useEffect(() => {
    if (!selectedVault || !selectedTargetTokenAddress) return;
    if (simulationsEnabled && toBN(debouncedAmount).gt(0) && !inputError) {
      dispatch(
        VaultsActions.getExpectedTransactionOutcome({
          transactionType: 'WITHDRAW',
          sourceTokenAddress: selectedVault.address,
          sourceTokenAmount: yvTokenAmount,
          targetTokenAddress: selectedTargetTokenAddress,
        })
      );
      dispatch(TokensActions.getTokensDynamicData({ addresses: [selectedVault.token.address] }));
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
    signature,
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

  const { error: networkError } = validateNetwork({
    currentNetwork,
    walletNetwork,
  });

  const amountValue = toBN(amount).times(normalizeAmount(selectedVault.token.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = toBN(debouncedAmount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetTokenAmount, selectedTargetToken?.decimals)
    : '';
  const expectedAmountValue = toBN(debouncedAmount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetTokenAmountUsdc, USDC_DECIMALS)
    : '0';
  const underlyingTokenBalance = calculateUnderlyingAmount({
    shareAmount: toUnit(selectedVault.DEPOSIT.userBalance, parseInt(selectedVault.decimals)),
    underlyingTokenDecimals: selectedVault.token.decimals.toString(),
    pricePerShare: selectedVault.pricePerShare,
  });
  const percentageToWithdraw = toBN(amount)
    .div(toUnit(underlyingTokenBalance, selectedVault.token.decimals))
    .times(100)
    .toString();
  const willWithdrawAll = toBN(percentageToWithdraw).gte(99);

  const selectedVaultOption = {
    address: selectedVault.address,
    symbol: selectedVault.displayName,
    icon: selectedVault.displayIcon,
    balance: underlyingTokenBalance,
    balanceUsdc: selectedVault.DEPOSIT.userDepositedUsdc,
    decimals: selectedVault.token.decimals,
  };

  const sourceError = networkError || allowanceError || inputError;
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

  // NOTE if there is no onClose then we are on vault details
  let transactionCompletedLabel;
  if (!onClose) {
    transactionCompletedLabel = t('components.transaction.status.done');
  }

  const onTransactionCompletedDismissed = () => {
    if (onClose) {
      onClose();
    } else {
      setTxCompleted(false);
      dispatch(VaultsActions.clearTransactionData());
    }
  };

  const approve = async () => {
    try {
      if (signedApprovalsEnabled) {
        const signResult = await dispatchAndUnwrap(VaultsActions.signZapOut({ vaultAddress: selectedVault.address }));
        setSignature(signResult.signature);
      } else {
        await dispatch(
          VaultsActions.approveZapOut({ vaultAddress: selectedVault.address, tokenAddress: selectedTargetTokenAddress })
        );
      }
    } catch (error) {}
  };

  const withdraw = async () => {
    try {
      await dispatchAndUnwrap(
        VaultsActions.withdrawVault({
          vaultAddress: selectedVault.address,
          amount: willWithdrawAll ? toBN(MAX_UINT256) : toBN(amount),
          targetTokenAddress: selectedTargetTokenAddress,
          slippageTolerance: selectedSlippage,
          signature,
        })
      );
      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: signedApprovalsEnabled ? t('components.transaction.sign') : t('components.transaction.approve'),
      onAction: approve,
      status: actionsStatus.approveZapOut,
      disabled: isApproved,
    },
    {
      label: t('components.transaction.withdraw'),
      onAction: withdraw,
      status: actionsStatus.withdraw,
      disabled: !isApproved || !isValidAmount || expectedTxOutcomeStatus.loading || selectedVault.withdrawalsDisabled,
    },
  ];

  return (
    <Transaction
      transactionLabel={header}
      transactionCompleted={txCompleted}
      transactionCompletedLabel={transactionCompletedLabel}
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
      targetAmountDisabled={!simulationsEnabled}
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
