import { FC, useState, useEffect } from 'react';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap, useDebounce, useAppTranslation } from '@hooks';
import {
  TokensSelectors,
  LabsSelectors,
  LabsActions,
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
  USDC_DECIMALS,
  validateVaultWithdraw,
  validateVaultWithdrawAllowance,
  validateSlippage,
  validateNetwork,
  toWei,
} from '@utils';
import { getConfig } from '@config';

import { Transaction } from '../Transaction';

export interface LabWithdrawTxProps {
  onClose?: () => void;
}

export const LabWithdrawTx: FC<LabWithdrawTxProps> = ({ onClose, children, ...props }) => {
  const { t } = useAppTranslation('common');

  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const { CONTRACT_ADDRESSES, NETWORK_SETTINGS } = getConfig();
  const [amount, setAmount] = useState('');
  const [debouncedAmount, isDebouncePending] = useDebounce(amount, 500);
  const [txCompleted, setTxCompleted] = useState(false);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
  const selectedLab = useAppSelector(LabsSelectors.selectSelectedLab);
  const tokenSelectorFilter = useAppSelector(TokensSelectors.selectToken);
  const selectedLabToken = tokenSelectorFilter(selectedLab?.address ?? '');
  let zapOutTokens = useAppSelector(TokensSelectors.selectZapOutTokens);
  zapOutTokens = selectedLab?.allowZapOut ? zapOutTokens : [];
  const [selectedTargetTokenAddress, setSelectedTargetTokenAddress] = useState(selectedLab?.defaultDisplayToken ?? '');
  const selectedSlippage = useAppSelector(SettingsSelectors.selectDefaultSlippage);

  const targetTokensOptions = selectedLab
    ? [selectedLab.token, ...zapOutTokens.filter(({ address }) => address !== selectedLab.token.address)]
    : zapOutTokens;
  const targetTokensOptionsMap = keyBy(targetTokensOptions, 'address');
  const selectedTargetToken = targetTokensOptionsMap[selectedTargetTokenAddress];
  const expectedTxOutcome = useAppSelector(VaultsSelectors.selectExpectedTxOutcome);
  const expectedTxOutcomeStatus = useAppSelector(VaultsSelectors.selectExpectedTxOutcomeStatus);
  const actionsStatus = useAppSelector(LabsSelectors.selectSelectedLabActionsStatusMap);

  // NOTE: We contemplate that in labs withdraw user always will be using yvToken instead of
  // underlyingToken like in vaults. Thats why amount is in yvToken already and we dont need
  // to calculate shares amount.
  const yvTokenAmountInWei = toWei(amount.toString(), parseInt(selectedLab!.decimals));

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
    if (!selectedLab || !walletIsConnected) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedLab.address,
        spenderAddress: CONTRACT_ADDRESSES.zapOut,
      })
    );
  }, [selectedTargetTokenAddress, selectedLab?.address, walletIsConnected]);

  useEffect(() => {
    if (!selectedLab) return;
    dispatch(LabsActions.clearLabStatus({ labAddress: selectedLab.address }));
  }, [debouncedAmount, selectedTargetTokenAddress, selectedLab]);

  useEffect(() => {
    if (!selectedLab || !selectedTargetTokenAddress) return;
    if (toBN(debouncedAmount).gt(0) && !inputError) {
      dispatch(
        VaultsActions.getExpectedTransactionOutcome({
          transactionType: 'WITHDRAW',
          sourceTokenAddress: selectedLab.address,
          sourceTokenAmount: yvTokenAmountInWei,
          targetTokenAddress: selectedTargetTokenAddress,
        })
      );
    }
  }, [debouncedAmount]);

  if (!selectedLab || !selectedTargetToken || !targetTokensOptions) {
    return null;
  }

  // TODO: FIX WITH CORRECT LAB VALIDATIONS
  const { approved: isApproved, error: allowanceError } = validateVaultWithdrawAllowance({
    yvTokenAddress: selectedLab.address,
    yvTokenAmount: toBN(amount), // normalized
    yvTokenDecimals: selectedLab.decimals,
    underlyingTokenAddress: selectedLab.token.address,
    targetTokenAddress: selectedTargetTokenAddress,
    yvTokenAllowancesMap: selectedLab.allowancesMap,
  });

  const { approved: isValidAmount, error: inputError } = validateVaultWithdraw({
    yvTokenAmount: toBN(amount), // normalized
    yvTokenDecimals: selectedLab.decimals,
    userYvTokenBalance: selectedLab.DEPOSIT.userBalance,
  });

  const { error: slippageError } = validateSlippage({
    slippageTolerance: selectedSlippage,
    expectedSlippage: expectedTxOutcome?.slippage,
  });

  const { error: networkError } = validateNetwork({
    currentNetwork,
    walletNetwork,
  });

  const selectedLabOption = {
    address: selectedLab.address,
    symbol: selectedLab.displayName,
    icon: selectedLab.displayIcon,
    balance: selectedLab.DEPOSIT.userBalance,
    balanceUsdc: selectedLab.DEPOSIT.userDepositedUsdc,
    decimals: toBN(selectedLab.decimals).toNumber(),
  };

  const amountValue = toBN(amount).times(normalizeAmount(selectedLabToken.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = toBN(debouncedAmount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetUnderlyingTokenAmount, selectedLab?.token.decimals)
    : '';
  const expectedAmountValue = toBN(debouncedAmount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetTokenAmountUsdc, USDC_DECIMALS)
    : '0';

  const sourceError = networkError || allowanceError || inputError;
  const targetStatus = {
    error:
      expectedTxOutcomeStatus.error ||
      actionsStatus.approveWithdraw.error ||
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
    // NOTE if there is no onClose then we are on vault details
    if (onClose) {
      onClose();
    } else {
      setTxCompleted(false);
      dispatch(VaultsActions.clearTransactionData());
    }
  };

  const approve = async () => {
    await dispatch(LabsActions.approveWithdraw({ labAddress: selectedLab.address }));
  };

  const withdraw = async () => {
    try {
      await dispatchAndUnwrap(
        LabsActions.withdraw({
          labAddress: selectedLab.address,
          amount: toBN(amount),
          tokenAddress: selectedTargetTokenAddress,
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
      status: actionsStatus.approveWithdraw,
      disabled: isApproved,
    },
    {
      label: t('components.transaction.withdraw'),
      onAction: withdraw,
      status: actionsStatus.withdraw,
      disabled: !isApproved || !isValidAmount || expectedTxOutcomeStatus.loading,
    },
  ];

  return (
    <Transaction
      transactionLabel={t('components.transaction.withdraw')}
      transactionCompleted={txCompleted}
      transactionCompletedLabel={transactionCompletedLabel}
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader={t('components.transaction.from-vault')}
      sourceAssetOptions={[selectedLabOption]}
      selectedSourceAsset={selectedLabOption}
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
