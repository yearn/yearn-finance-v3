import { FC, useState, useEffect } from 'react';
import { keyBy } from 'lodash';

import {
  useAppSelector,
  useAppDispatch,
  useAppDispatchAndUnwrap,
  useDebounce,
  useAppTranslation,
  useAllowance,
} from '@hooks';
import {
  TokensSelectors,
  VaultsSelectors,
  VaultsActions,
  TokensActions,
  SettingsSelectors,
  NetworkSelectors,
  WalletSelectors,
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
  basicValidateAllowance,
  createPlaceholderToken,
} from '@utils';
import { getConfig } from '@config';
import { TokenView } from '@src/core/types';

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
  const { NETWORK_SETTINGS, ETHEREUM_ADDRESS } = getConfig();
  const [amount, setAmount] = useState('');
  const [debouncedAmount, isDebouncePending] = useDebounce(amount, 500);
  const [txCompleted, setTxCompleted] = useState(false);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
  const vaults = useAppSelector(VaultsSelectors.selectLiveVaults);
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const selectedSellTokenAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  let userTokens = useAppSelector(TokensSelectors.selectZapInTokens);
  userTokens = selectedVault?.allowZapIn ? userTokens : [];
  const selectedSlippage = useAppSelector(SettingsSelectors.selectDefaultSlippage);
  const expectedTxOutcome = useAppSelector(VaultsSelectors.selectExpectedTxOutcome);
  const expectedTxOutcomeStatus = useAppSelector(VaultsSelectors.selectExpectedTxOutcomeStatus);
  const actionsStatus = useAppSelector(VaultsSelectors.selectSelectedVaultActionsStatusMap);
  const selectedTokenMap = useAppSelector(TokensSelectors.selectTokensMap);

  const sellTokensOptions = selectedVault
    ? [selectedVault.token, ...userTokens.filter(({ address }) => address !== selectedVault.token.address)]
    : userTokens;
  const sellTokensOptionsMap = keyBy(sellTokensOptions, 'address');
  let selectedSellToken: TokenView | undefined = sellTokensOptionsMap[selectedSellTokenAddress ?? ''];
  const [tokenAllowance, isLoadingTokenAllowance, tokenAllowanceErrors] = useAllowance({
    tokenAddress: selectedSellTokenAddress,
    vaultAddress: selectedVault?.address,
  });
  const addressIsNativeCurrency = selectedSellTokenAddress === ETHEREUM_ADDRESS;
  const shouldUseNativeCurrency = typeof selectedSellToken === 'undefined' && addressIsNativeCurrency;
  if (shouldUseNativeCurrency) {
    const tokenData = selectedTokenMap[ETHEREUM_ADDRESS];
    selectedSellToken = createPlaceholderToken(tokenData);
  }

  const onExit = () => {
    dispatch(VaultsActions.clearSelectedVaultAndStatus());
    dispatch(VaultsActions.clearTransactionData());
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: undefined }));
  };

  useEffect(() => {
    if (!selectedSellTokenAddress && selectedVault) {
      dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: selectedVault.defaultDisplayToken }));
    }

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
    if (!selectedVault) return;
    dispatch(VaultsActions.clearVaultStatus({ vaultAddress: selectedVault.address }));
  }, [debouncedAmount, selectedSellTokenAddress, selectedVault]);

  useEffect(() => {
    if (!selectedVault || !selectedSellTokenAddress) return;
    if (toBN(debouncedAmount).gt(0) && !inputError && selectedSellToken) {
      dispatch(
        VaultsActions.getExpectedTransactionOutcome({
          transactionType: 'DEPOSIT',
          sourceTokenAddress: selectedSellTokenAddress,
          sourceTokenAmount: toWei(debouncedAmount, selectedSellToken.decimals),
          targetTokenAddress: selectedVault.address,
        })
      );
      dispatch(TokensActions.getTokensDynamicData({ addresses: [selectedSellTokenAddress] }));
    }
  }, [debouncedAmount]);

  if (!selectedVault || !selectedSellTokenAddress || !selectedSellToken || !sellTokensOptions) {
    return null;
  }

  const { approved: isApproved, error: allowanceError } = basicValidateAllowance({
    tokenAddress: selectedSellTokenAddress,
    tokenAmount: toBN(debouncedAmount),
    tokenDecimals: selectedSellToken.decimals.toString(),
    rawAllowance: tokenAllowance?.amount || '0',
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
  });

  const { error: networkError } = validateNetwork({
    currentNetwork,
    walletNetwork,
  });

  const vaultsOptions = vaults
    .filter(({ address }) => allowVaultSelect || selectedVault.address === address)
    .map(({ address, displayName, displayIcon, DEPOSIT, token, apyData, apyMetadata }) => ({
      address,
      symbol: displayName,
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
      actionsStatus.approve.error ||
      actionsStatus.deposit.error ||
      slippageError ||
      tokenAllowanceErrors,
    loading: expectedTxOutcomeStatus.loading || isDebouncePending || isLoadingTokenAllowance,
  };

  const loadingText = currentNetworkSettings.simulationsEnabled
    ? t('components.transaction.status.simulating')
    : t('components.transaction.status.calculating');

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
    selectedSellToken &&
      (await dispatch(
        VaultsActions.approveDeposit({ vaultAddress: selectedVault.address, tokenAddress: selectedSellToken.address })
      ));
  };

  const deposit = async () => {
    try {
      if (selectedSellToken) {
        await dispatchAndUnwrap(
          VaultsActions.depositVault({
            vaultAddress: selectedVault.address,
            tokenAddress: selectedSellToken.address,
            amount: toBN(amount),
            slippageTolerance: selectedSlippage,
            targetUnderlyingTokenAmount: expectedTxOutcome?.targetUnderlyingTokenAmount,
          })
        );
        setTxCompleted(true);
      }
    } catch (error) {}
  };

  const txActions = [
    {
      label: t('components.transaction.approve'),
      onAction: approve,
      status: actionsStatus.approve,
      disabled: isApproved || selectedVault.depositsDisabled || isLoadingTokenAllowance,
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
      contrast: true,
    },
  ];

  return (
    <Transaction
      transactionLabel={header}
      transactionCompleted={txCompleted}
      transactionCompletedLabel={transactionCompletedLabel}
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader={t('components.transaction.from-wallet')}
      sourceAssetOptions={allowTokenSelect ? sellTokensOptions : [selectedSellToken]}
      selectedSourceAsset={selectedSellToken}
      onSelectedSourceAssetChange={onSelectedSellTokenChange}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      onSourceAmountChange={setAmount}
      targetHeader={t('components.transaction.to-vault')}
      targetAssetOptions={vaultsOptions}
      selectedTargetAsset={selectedVaultOption}
      onSelectedTargetAssetChange={onSelectedVaultChange}
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
