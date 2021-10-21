import { FC, useState, useEffect } from 'react';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap, useDebounce } from '@hooks';
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
  toWei,
  USDC_DECIMALS,
  validateVaultDeposit,
  validateVaultAllowance,
  validateSlippage,
  getZapInContractAddress,
  formatPercent,
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
  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const { NETWORK_SETTINGS } = getConfig();
  const [amount, setAmount] = useState('');
  const [debouncedAmount, isDebouncePending] = useDebounce(amount, 500);
  const [txCompleted, setTxCompleted] = useState(false);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
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

  const sellTokensOptions = selectedVault
    ? [selectedVault.token, ...userTokens.filter(({ address }) => address !== selectedVault.token.address)]
    : userTokens;
  const sellTokensOptionsMap = keyBy(sellTokensOptions, 'address');
  const selectedSellToken = sellTokensOptionsMap[selectedSellTokenAddress ?? ''];

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
      const highestYieldingVault = vaults.reduce((prev, current) => (prev.apyData > current.apyData ? prev : current));
      dispatch(
        VaultsActions.setSelectedVaultAddress({
          vaultAddress: matchingVault?.address ?? highestYieldingVault.address,
        })
      );
    }

    return () => {
      // TODO Fix clear on vault details
      onExit();
    };
  }, []);

  useEffect(() => {
    if (!selectedVault || !selectedSellTokenAddress) return;

    const isZap = selectedSellTokenAddress !== selectedVault.token.address;
    const spenderAddress = isZap ? getZapInContractAddress(selectedVault.address) : selectedVault.address;
    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedSellTokenAddress,
        spenderAddress,
      })
    );
  }, [selectedSellTokenAddress]);

  useEffect(() => {
    if (!selectedVault) return;
    dispatch(VaultsActions.clearVaultStatus({ vaultAddress: selectedVault.address }));
  }, [debouncedAmount, selectedSellTokenAddress, selectedVault]);

  useEffect(() => {
    if (!selectedVault || !selectedSellTokenAddress) return;
    if (toBN(debouncedAmount).gt(0) && !inputError) {
      dispatch(
        VaultsActions.getExpectedTransactionOutcome({
          transactionType: 'DEPOSIT',
          sourceTokenAddress: selectedSellTokenAddress,
          sourceTokenAmount: toWei(debouncedAmount, selectedSellToken.decimals),
          targetTokenAddress: selectedVault.address,
        })
      );
    }
  }, [debouncedAmount]);

  if (!selectedVault || !selectedSellTokenAddress || !selectedSellToken || !sellTokensOptions) {
    return null;
  }

  const { approved: isApproved, error: allowanceError } = validateVaultAllowance({
    amount: toBN(debouncedAmount),
    vaultAddress: selectedVault.address,
    vaultUnderlyingTokenAddress: selectedVault.token.address,
    sellTokenAddress: selectedSellTokenAddress,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    sellTokenAllowancesMap: selectedSellToken.allowancesMap,
  });

  const { approved: isValidAmount, error: inputError } = validateVaultDeposit({
    sellTokenAmount: toBN(debouncedAmount),
    depositLimit: selectedVault.depositLimit,
    emergencyShutdown: selectedVault.emergencyShutdown,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    userTokenBalance: selectedSellToken.balance,
    vaultUnderlyingBalance: selectedVault.vaultBalance,
  });

  const { error: slippageError } = validateSlippage({
    slippageTolerance: selectedSlippage,
    expectedSlippage: expectedTxOutcome?.slippage,
  });

  const vaultsOptions = vaults
    .filter(({ address }) => allowVaultSelect || selectedVault.address === address)
    .map(({ address, displayName, displayIcon, DEPOSIT, token, apyData }) => ({
      address,
      symbol: displayName,
      icon: displayIcon,
      balance: DEPOSIT.userDeposited,
      balanceUsdc: DEPOSIT.userDepositedUsdc,
      decimals: token.decimals,
      yield: formatPercent(apyData, 2),
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

  const sourceError = allowanceError || inputError;

  const targetStatus = {
    error:
      expectedTxOutcomeStatus.error ||
      actionsStatus.approve.error ||
      actionsStatus.deposit.error ||
      expectedTxOutcomeStatus.error ||
      slippageError,
    loading: expectedTxOutcomeStatus.loading || isDebouncePending,
  };

  const loadingText = currentNetworkSettings.simulationsEnabled ? 'Simulating...' : 'Calculating...';

  const onSelectedSellTokenChange = (tokenAddress: string) => {
    setAmount('');
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress }));
  };

  const onSelectedVaultChange = (vaultAddress: string) => {
    setAmount('');
    dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress }));
  };

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const approve = async () => {
    await dispatch(
      VaultsActions.approveDeposit({ vaultAddress: selectedVault.address, tokenAddress: selectedSellToken.address })
    );
  };

  const deposit = async () => {
    try {
      await dispatchAndUnwrap(
        VaultsActions.depositVault({
          vaultAddress: selectedVault.address,
          tokenAddress: selectedSellToken.address,
          amount: toBN(amount),
          slippageTolerance: selectedSlippage,
        })
      );
      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: 'Approve',
      onAction: approve,
      status: actionsStatus.approve,
      disabled: isApproved,
    },
    {
      label: 'Deposit',
      onAction: deposit,
      status: actionsStatus.deposit,
      disabled: !isApproved || !isValidAmount || expectedTxOutcomeStatus.loading || isDebouncePending,
      contrast: true,
    },
  ];

  return (
    <Transaction
      transactionLabel={header}
      transactionCompleted={txCompleted}
      transactionCompletedLabel="Exit"
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader="From wallet"
      sourceAssetOptions={allowTokenSelect ? sellTokensOptions : [selectedSellToken]}
      selectedSourceAsset={selectedSellToken}
      onSelectedSourceAssetChange={onSelectedSellTokenChange}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      onSourceAmountChange={setAmount}
      targetHeader="To vault"
      targetAssetOptions={vaultsOptions}
      selectedTargetAsset={selectedVaultOption}
      onSelectedTargetAssetChange={onSelectedVaultChange}
      targetAmount={expectedAmount}
      targetAmountValue={expectedAmountValue}
      targetStatus={targetStatus}
      actions={txActions}
      status={{ error: sourceError }}
      loadingText={loadingText}
      onClose={onClose}
    />
  );
};
