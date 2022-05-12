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
  LabsSelectors,
  LabsActions,
  TokensActions,
  VaultsActions,
  VaultsSelectors,
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
  validateVaultAllowance,
} from '@utils';
import { getConfig } from '@config';

import { Transaction } from '../Transaction';

export interface LabDepositTxProps {
  onClose?: () => void;
}

export const LabDepositTx: FC<LabDepositTxProps> = ({ onClose }) => {
  const { t } = useAppTranslation('common');

  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const { NETWORK_SETTINGS } = getConfig();
  const [amount, setAmount] = useState('');
  const [debouncedAmount, isDebouncePending] = useDebounce(amount, 500);
  const [txCompleted, setTxCompleted] = useState(false);
  const [isFetchingAllowance, setIsFetchingAllowance] = useState(false);
  const servicesEnabled = useAppSelector(AppSelectors.selectServicesEnabled);
  const simulationsEnabled = servicesEnabled['tenderly'];
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const isWalletConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
  const selectedLab = useAppSelector(LabsSelectors.selectSelectedLab);
  const selectedSellTokenAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  const selectedSlippage = useAppSelector(SettingsSelectors.selectDefaultSlippage);

  // TODO: ADD EXPECTED OUTCOME TO LABS
  const expectedTxOutcome = useAppSelector(VaultsSelectors.selectExpectedTxOutcome);
  const expectedTxOutcomeStatus = useAppSelector(VaultsSelectors.selectExpectedTxOutcomeStatus);
  const actionsStatus = useAppSelector(LabsSelectors.selectSelectedLabActionsStatusMap);
  const { selectedSellToken, sourceAssetOptions } = useSelectedSellToken({
    selectedSellTokenAddress,
    selectedVaultOrLab: selectedLab,
  });

  const onExit = () => {
    dispatch(LabsActions.clearSelectedLabAndStatus());
    dispatch(VaultsActions.clearTransactionData());
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: undefined }));
  };

  useEffect(() => {
    if (!selectedSellTokenAddress && selectedLab) {
      dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: selectedLab.defaultDisplayToken }));
    }

    return () => {
      onExit();
    };
  }, []);

  useEffect(() => {
    if (!selectedLab || !selectedSellTokenAddress || !isWalletConnected) return;
    const fetchAllowance = async () => {
      setIsFetchingAllowance(true);
      await dispatch(
        LabsActions.getDepositAllowance({
          labAddress: selectedLab.address,
          tokenAddress: selectedSellTokenAddress,
        })
      );
      setIsFetchingAllowance(false);
    };
    fetchAllowance();
  }, [selectedSellTokenAddress, selectedLab?.address, isWalletConnected]);

  useEffect(() => {
    if (!selectedLab) return;
    dispatch(LabsActions.clearLabStatus({ labAddress: selectedLab.address }));
  }, [debouncedAmount, selectedSellTokenAddress, selectedLab]);

  // TODO: SET LABS SIMULATION
  useEffect(() => {
    if (!selectedLab || !selectedSellTokenAddress || toBN(debouncedAmount).lte(0) || inputError || !selectedSellToken) {
      return;
    }

    dispatch(
      VaultsActions.getExpectedTransactionOutcome({
        transactionType: 'DEPOSIT',
        sourceTokenAddress: selectedSellTokenAddress,
        sourceTokenAmount: toWei(debouncedAmount, selectedSellToken.decimals),
        targetTokenAddress: selectedLab.address,
      })
    );
  }, [debouncedAmount]);

  if (!selectedLab || !selectedSellTokenAddress || !selectedSellToken) {
    return null;
  }

  const { approved: isApproved, error: allowanceError } = validateVaultAllowance({
    amount: toBN(debouncedAmount),
    vaultAddress: selectedLab.address,
    vaultUnderlyingTokenAddress: selectedLab.token.address,
    sellTokenAddress: selectedSellTokenAddress,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    sellTokenAllowancesMap: selectedSellToken.allowancesMap,
  });

  const { approved: isValidAmount, error: inputError } = validateVaultDeposit({
    sellTokenAmount: toBN(debouncedAmount),
    depositLimit: '0',
    emergencyShutdown: false,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    userTokenBalance: selectedSellToken.balance,
    vaultUnderlyingBalance: selectedLab.labBalance,
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

  const sourceError = networkError || allowanceError || inputError;

  const targetStatus = {
    error:
      expectedTxOutcomeStatus.error ||
      actionsStatus.approveDeposit.error ||
      actionsStatus.deposit.error ||
      slippageError,
    loading: expectedTxOutcomeStatus.loading || isDebouncePending,
  };

  const selectedLabOption = {
    address: selectedLab.address,
    symbol: selectedLab.displayName,
    icon: selectedLab.displayIcon,
    balance: selectedLab.DEPOSIT.userBalance,
    balanceUsdc: selectedLab.DEPOSIT.userDepositedUsdc,
    decimals: toBN(selectedLab.decimals).toNumber(),
    yield: formatApy(selectedLab.apyData, selectedLab.apyMetadata?.type),
  };

  const amountValue = toBN(amount).times(normalizeAmount(selectedSellToken.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = toBN(debouncedAmount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetTokenAmount, toBN(selectedLab?.decimals).toNumber())
    : '';
  const expectedAmountValue = toBN(debouncedAmount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetTokenAmountUsdc, USDC_DECIMALS)
    : '0';

  const loadingText = currentNetworkSettings.simulationsEnabled
    ? t('components.transaction.status.simulating')
    : t('components.transaction.status.calculating');

  const onSelectedSellTokenChange = (tokenAddress: string) => {
    setAmount('');
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress }));
  };

  const onSelectedLabChange = (labAddress: string) => {
    setAmount('');
    dispatch(LabsActions.setSelectedLabAddress({ labAddress }));
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
      LabsActions.approveDeposit({ labAddress: selectedLab.address, tokenAddress: selectedSellToken.address })
    );
  };

  const deposit = async () => {
    try {
      if (!selectedSellToken) return;

      await dispatchAndUnwrap(
        LabsActions.deposit({
          labAddress: selectedLab.address,
          tokenAddress: selectedSellToken.address,
          amount: toBN(amount),
          slippageTolerance: selectedSlippage,
          targetUnderlyingTokenAmount: expectedTxOutcome?.targetUnderlyingTokenAmount,
        })
      );
      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: t('components.transaction.approve'),
      onAction: approve,
      status: actionsStatus.approveDeposit,
      disabled: isApproved || isFetchingAllowance,
    },
    {
      label: t('components.transaction.deposit'),
      onAction: deposit,
      status: actionsStatus.deposit,
      disabled: !isApproved || !isValidAmount || expectedTxOutcomeStatus.loading,
    },
  ];

  return (
    <Transaction
      transactionLabel={t('components.transaction.deposit')}
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
      targetHeader={t('components.transaction.to-vault')}
      targetAssetOptions={[selectedLabOption]}
      selectedTargetAsset={selectedLabOption}
      onSelectedTargetAssetChange={onSelectedLabChange}
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
