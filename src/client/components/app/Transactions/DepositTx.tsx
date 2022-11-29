import { FC, useState, useEffect } from 'react';

import {
  useAppSelector,
  useAppDispatch,
  useAppDispatchAndUnwrap,
  useDebounce,
  useAppTranslation,
  useSelectedSellToken,
} from '@hooks';
import {
  TokensSelectors,
  VaultsSelectors,
  VaultsActions,
  TokensActions,
  SettingsSelectors,
  NetworkSelectors,
  WalletSelectors,
  AppSelectors,
} from '@store';
import {
  toBN,
  normalizeAmount,
  toWei,
  USDC_DECIMALS,
  validateVaultDeposit,
  validateSlippage,
  validateNetwork,
  formatApy,
  validateAllowance,
} from '@utils';
import { getConfig } from '@config';

import { Transaction } from './Transaction';

export interface DepositTxProps {
  header?: string;
  allowTokenSelect?: boolean;
  allowVaultSelect?: boolean;
  onClose?: () => void;
}

export const DepositTx: FC<DepositTxProps> = ({
  header,
  onClose,
  allowTokenSelect = true,
  allowVaultSelect = false,
}) => {
  const { t } = useAppTranslation('common');

  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const { NETWORK_SETTINGS, CONTRACT_ADDRESSES } = getConfig();
  const [amount, setAmount] = useState('');
  const [debouncedAmount, isDebouncePending] = useDebounce(amount, 500);
  const [txCompleted, setTxCompleted] = useState(false);
  const [spenderAddress, setSpenderAddress] = useState('');
  const [isFetchingAllowance, setIsFetchingAllowance] = useState(false);
  const [isGasless, setIsGasless] = useState(false);
  const servicesEnabled = useAppSelector(AppSelectors.selectServicesEnabled);
  const simulationsEnabled = servicesEnabled.simulations;
  const zapsEnabled = servicesEnabled.zaps;
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const isWalletConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
  const vaults = useAppSelector(VaultsSelectors.selectLiveVaults);
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const selectedSellTokenAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  const selectedSlippage = useAppSelector(SettingsSelectors.selectDefaultSlippage);
  const expectedTxOutcome = useAppSelector(VaultsSelectors.selectExpectedTxOutcome);
  const expectedTxOutcomeStatus = useAppSelector(VaultsSelectors.selectExpectedTxOutcomeStatus);
  const actionsStatus = useAppSelector(VaultsSelectors.selectSelectedVaultActionsStatusMap);
  const { selectedSellToken, sourceAssetOptions } = useSelectedSellToken({
    selectedSellTokenAddress,
    selectedVaultOrLab: selectedVault,
    allowTokenSelect,
  });
  const allowGasless = selectedVault?.token.address === selectedSellTokenAddress && currentNetwork === 'mainnet';

  const onExit = () => {
    dispatch(VaultsActions.clearSelectedVaultAndStatus());
    dispatch(VaultsActions.clearTransactionData());
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: undefined }));
  };

  useEffect(() => {
    if (!selectedSellTokenAddress && selectedVault) {
      dispatch(
        TokensActions.setSelectedTokenAddress({
          tokenAddress:
            !zapsEnabled && selectedVault.zapInWith ? selectedVault.token.address : selectedVault.defaultDisplayToken,
        })
      );
    }
  }, [selectedSellTokenAddress, selectedVault]);

  useEffect(() => {
    if (!selectedVault) {
      if (!vaults || !vaults.length) return;

      const matchingVault = vaults.find(
        (vault) =>
          vault.token.address === selectedSellTokenAddress || vault.defaultDisplayToken === selectedSellTokenAddress
      );
      const vaultsWithZapIn = vaults.filter((vault) => vault.allowZapIn);
      const highestYieldingVault = vaultsWithZapIn.reduce(
        (prev, current) => (parseFloat(prev.apyData) > parseFloat(current.apyData) ? prev : current),
        vaultsWithZapIn[0]
      );
      dispatch(
        VaultsActions.setSelectedVaultAddress({
          vaultAddress: matchingVault?.address ?? highestYieldingVault.address,
        })
      );
    }

    return () => {
      onExit();
    };
  }, []);

  useEffect(() => {
    if (!selectedVault || !selectedSellTokenAddress || !isWalletConnected) return;
    const fetchAllowance = async () => {
      setIsFetchingAllowance(true);
      setSpenderAddress('');
      const allowance = await dispatchAndUnwrap(
        VaultsActions.getDepositAllowance({
          vaultAddress: selectedVault.address,
          tokenAddress: selectedSellTokenAddress,
          gasless: allowGasless && isGasless,
        })
      );
      setSpenderAddress(allowance.spender);
      setIsFetchingAllowance(false);
    };
    fetchAllowance();
  }, [selectedSellTokenAddress, selectedVault?.address, isWalletConnected, isGasless]);

  useEffect(() => {
    if (!selectedVault) return;
    dispatch(VaultsActions.clearVaultStatus({ vaultAddress: selectedVault.address }));
  }, [debouncedAmount, selectedSellTokenAddress, selectedVault]);

  useEffect(() => {
    if (
      !selectedVault ||
      !selectedSellTokenAddress ||
      toBN(debouncedAmount).lte(0) ||
      inputError ||
      !selectedSellToken
    ) {
      return;
    }

    if (simulationsEnabled) {
      dispatch(
        VaultsActions.getExpectedTransactionOutcome({
          transactionType: 'DEPOSIT',
          sourceTokenAddress: selectedSellTokenAddress,
          sourceTokenAmount: toWei(debouncedAmount, selectedSellToken.decimals),
          targetTokenAddress: selectedVault.address,
          gasless: allowGasless && isGasless,
        })
      );
    }
    dispatch(TokensActions.getTokensDynamicData({ addresses: [selectedSellTokenAddress] }));
  }, [debouncedAmount, isGasless]);

  if (!selectedVault || !selectedSellTokenAddress || !selectedSellToken) {
    return null;
  }

  const { approved: isApproved, error: allowanceError } = validateAllowance({
    tokenAmount: toBN(debouncedAmount),
    tokenAddress: selectedSellTokenAddress,
    tokenDecimals: selectedSellToken.decimals.toString(),
    tokenAllowancesMap: selectedSellToken.allowancesMap,
    spenderAddress,
  });

  const { approved: isValidAmount, error: inputError } = validateVaultDeposit({
    sellTokenAmount: toBN(debouncedAmount),
    depositLimit: selectedVault.depositLimit,
    emergencyShutdown: selectedVault.emergencyShutdown,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    userTokenBalance: selectedSellToken.balance,
    vaultUnderlyingBalance: selectedVault.vaultBalance,
    targetUnderlyingTokenAmount: expectedTxOutcome?.targetUnderlyingTokenAmount,
  });

  const { error: slippageError } = validateSlippage({
    slippageTolerance: selectedSlippage,
    expectedSlippage: expectedTxOutcome?.slippage,
    gasless: allowGasless && isGasless,
  });

  const { error: networkError } = validateNetwork({
    currentNetwork,
    walletNetwork,
  });

  const vaultsOptions = vaults
    .filter(({ address }) => allowVaultSelect || selectedVault.address === address)
    .map(({ address, displayIcon, DEPOSIT, token, apyData, apyMetadata }) => ({
      address,
      symbol: token.symbol,
      icon: displayIcon,
      balance: DEPOSIT.userDeposited,
      balanceUsdc: DEPOSIT.userDepositedUsdc,
      decimals: token.decimals,
      yield: formatApy(apyData, apyMetadata?.type),
    }));
  const selectedVaultOption = vaultsOptions.find(({ address }) => address === selectedVault.address)!;

  const amountValue = toBN(amount).times(normalizeAmount(selectedSellToken.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = toBN(debouncedAmount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetUnderlyingTokenAmount, selectedVault?.token.decimals)
    : '';
  const expectedAmountValue = toBN(debouncedAmount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetTokenAmountUsdc, USDC_DECIMALS)
    : '0';
  // const expectedAmountStatus = {
  //   error: expectedTxOutcomeStatus.error || error,
  //   loading: expectedTxOutcomeStatus.loading || isDebouncePending,
  // };

  const depositsDisabledError =
    selectedVault.depositsDisabled || selectedVault.hideIfNoDeposits ? 'Vault Deposits Disabled' : undefined;

  const sourceError = networkError || allowanceError || inputError || depositsDisabledError;

  const targetStatus = {
    error:
      expectedTxOutcomeStatus.error ||
      actionsStatus.approveDeposit.error ||
      actionsStatus.deposit.error ||
      slippageError,
    loading: expectedTxOutcomeStatus.loading || isDebouncePending,
  };

  const loadingText = currentNetworkSettings.simulationsEnabled
    ? t('components.transaction.status.simulating')
    : t('components.transaction.status.calculating');

  const isZap = selectedVault.token.address !== selectedSellTokenAddress;
  const isEthToWethZap =
    selectedSellTokenAddress === CONTRACT_ADDRESSES.ETH && selectedVault.address === CONTRACT_ADDRESSES.YVWETH;
  const zapService = isZap && !isEthToWethZap ? selectedVault.zapInWith : undefined;

  const onSelectedSellTokenChange = (tokenAddress: string) => {
    setAmount('');
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress }));
  };

  const onSelectedVaultChange = (vaultAddress: string) => {
    setAmount('');
    dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress }));
  };

  // NOTE if there is no onClose then we are on vault details
  let transactionCompletedLabel;
  if (!onClose) {
    transactionCompletedLabel = t('components.transaction.status.done');
  }

  const onTransactionCompletedDismissed = () => {
    // NOTE if there is no onClose then we are on vault details
    if (onClose) {
      onClose();
    } else {
      setTxCompleted(false);
      dispatch(VaultsActions.clearTransactionData());
    }
  };

  const approve = async () => {
    if (!selectedSellToken) return;

    await dispatch(
      VaultsActions.approveDeposit({
        vaultAddress: selectedVault.address,
        tokenAddress: selectedSellToken.address,
        gasless: allowGasless && isGasless,
      })
    );
  };

  const deposit = async () => {
    try {
      if (!selectedSellToken) return;

      if (allowGasless && isGasless) {
        await dispatchAndUnwrap(
          VaultsActions.gaslessDeposit({
            vaultAddress: selectedVault.address,
            tokenAddress: selectedSellToken.address,
            vaultAmount: expectedTxOutcome?.targetTokenAmount ?? '',
            tokenAmount: expectedTxOutcome?.sourceTokenAmount ?? '',
            feeAmount: expectedTxOutcome?.sourceTokenAmountFee ?? '',
          })
        );
      } else {
        await dispatchAndUnwrap(
          VaultsActions.depositVault({
            vaultAddress: selectedVault.address,
            tokenAddress: selectedSellToken.address,
            amount: toBN(amount),
            slippageTolerance: selectedSlippage,
            targetUnderlyingTokenAmount: expectedTxOutcome?.targetUnderlyingTokenAmount,
          })
        );
      }

      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: t('components.transaction.approve'),
      onAction: approve,
      status: actionsStatus.approveDeposit,
      disabled: isApproved || selectedVault.depositsDisabled || isFetchingAllowance,
    },
    {
      label: t('components.transaction.deposit'),
      onAction: deposit,
      status: actionsStatus.deposit,
      disabled:
        !isApproved ||
        !isValidAmount ||
        expectedTxOutcomeStatus.loading ||
        isDebouncePending ||
        selectedVault.depositsDisabled,
    },
  ];

  return (
    <Transaction
      transactionLabel={header}
      transactionCompleted={txCompleted}
      transactionCompletedLabel={transactionCompletedLabel}
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader={t('components.transaction.from-wallet')}
      sourceAssetOptions={sourceAssetOptions}
      selectedSourceAsset={selectedSellToken}
      onSelectedSourceAssetChange={onSelectedSellTokenChange}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      onSourceAmountChange={setAmount}
      displaySourceGuidance={allowTokenSelect}
      sourceStatus={{ error: sourceError }}
      targetHeader={t('components.transaction.to-vault')}
      targetAssetOptions={vaultsOptions}
      selectedTargetAsset={selectedVaultOption}
      onSelectedTargetAssetChange={onSelectedVaultChange}
      targetAmountDisabled={!simulationsEnabled}
      targetAmount={expectedAmount}
      targetAmountValue={expectedAmountValue}
      targetStatus={targetStatus}
      actions={txActions}
      zapService={zapService}
      allowGasless={allowGasless}
      isGasless={isGasless}
      onToggleGasless={setIsGasless}
      loadingText={loadingText}
      onClose={onClose}
    />
  );
};
