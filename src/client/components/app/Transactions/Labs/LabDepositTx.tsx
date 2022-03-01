import { FC, useState, useEffect } from 'react';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap, useDebounce, useAppTranslation } from '@hooks';
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
} from '@store';
import {
  toBN,
  normalizeAmount,
  toWei,
  USDC_DECIMALS,
  validateVaultDeposit,
  validateVaultAllowance,
  getZapInContractAddress,
  validateYvBoostEthActionsAllowance,
  validateSlippage,
  validateNetwork,
  formatApy,
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
  const { CONTRACT_ADDRESSES, NETWORK_SETTINGS } = getConfig();
  const { YVBOOST, PSLPYVBOOSTETH } = CONTRACT_ADDRESSES;
  const [amount, setAmount] = useState('');
  const [debouncedAmount, isDebouncePending] = useDebounce(amount, 500);
  const [txCompleted, setTxCompleted] = useState(false);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const currentNetworkSettings = NETWORK_SETTINGS[currentNetwork];
  const selectedLab = useAppSelector(LabsSelectors.selectSelectedLab);
  const selectedSellTokenAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  let userTokens = useAppSelector(TokensSelectors.selectZapInTokens);
  userTokens = selectedLab?.allowZapIn ? userTokens : [];
  const selectedSlippage = useAppSelector(SettingsSelectors.selectDefaultSlippage);

  // TODO: ADD EXPECTED OUTCOME TO LABS
  const expectedTxOutcome = useAppSelector(VaultsSelectors.selectExpectedTxOutcome);
  const expectedTxOutcomeStatus = useAppSelector(VaultsSelectors.selectExpectedTxOutcomeStatus);
  const actionsStatus = useAppSelector(LabsSelectors.selectSelectedLabActionsStatusMap);

  const sellTokensOptions = selectedLab
    ? [selectedLab.token, ...userTokens.filter(({ address }) => address !== selectedLab.token.address)]
    : userTokens;
  const sellTokensOptionsMap = keyBy(sellTokensOptions, 'address');
  const selectedSellToken = sellTokensOptionsMap[selectedSellTokenAddress ?? ''];

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
    if (!selectedLab || !selectedSellTokenAddress) return;

    const isZap = selectedSellTokenAddress !== selectedLab.token.address || selectedLab.address === PSLPYVBOOSTETH;
    const spenderAddress = isZap ? getZapInContractAddress(selectedLab.address) : selectedLab.address;

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
  }, [debouncedAmount, selectedSellTokenAddress, selectedLab]);

  // TODO: SET LABS SIMULATION
  useEffect(() => {
    if (!selectedLab || !selectedSellTokenAddress) return;
    if (toBN(debouncedAmount).gt(0) && !inputError) {
      dispatch(
        VaultsActions.getExpectedTransactionOutcome({
          transactionType: 'DEPOSIT',
          sourceTokenAddress: selectedSellTokenAddress,
          sourceTokenAmount: toWei(debouncedAmount, selectedSellToken.decimals),
          targetTokenAddress: selectedLab.address,
        })
      );
    }
  }, [debouncedAmount]);

  if (!selectedLab || !selectedSellTokenAddress || !selectedSellToken || !sellTokensOptions) {
    return null;
  }

  let isApproved: boolean | undefined;
  let allowanceError: string | undefined;

  if (selectedLab.address === YVBOOST) {
    const { approved, error } = validateVaultAllowance({
      amount: toBN(debouncedAmount),
      vaultAddress: selectedLab.address,
      vaultUnderlyingTokenAddress: selectedLab.token.address,
      sellTokenAddress: selectedSellTokenAddress,
      sellTokenDecimals: selectedSellToken.decimals.toString(),
      sellTokenAllowancesMap: selectedSellToken.allowancesMap,
    });
    isApproved = approved;
    allowanceError = error;
  }

  if (selectedLab.address === PSLPYVBOOSTETH) {
    const { approved, error } = validateYvBoostEthActionsAllowance({
      action: 'INVEST',
      sellTokenAmount: toBN(debouncedAmount),
      sellTokenAddress: selectedSellTokenAddress,
      sellTokenDecimals: selectedSellToken.decimals.toString(),
      sellTokenAllowancesMap: selectedSellToken.allowancesMap,
    });
    isApproved = approved;
    allowanceError = error;
  }

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

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const approve = async () => {
    await dispatch(
      LabsActions.approveDeposit({
        labAddress: selectedLab.address,
        tokenAddress: selectedSellToken.address,
      })
    );
  };

  const deposit = async () => {
    try {
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
      disabled: isApproved,
    },
    {
      label: t('components.transaction.deposit'),
      onAction: deposit,
      status: actionsStatus.deposit,
      disabled: !isApproved || !isValidAmount || expectedTxOutcomeStatus.loading,
      contrast: true,
    },
  ];

  return (
    // TODO Check transactionCompletedLabel (I think it's not used)
    <Transaction
      transactionLabel={t('components.transaction.deposit')}
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
      targetHeader={t('components.transaction.to-vault')}
      targetAssetOptions={[selectedLabOption]}
      selectedTargetAsset={selectedLabOption}
      onSelectedTargetAssetChange={onSelectedLabChange}
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
