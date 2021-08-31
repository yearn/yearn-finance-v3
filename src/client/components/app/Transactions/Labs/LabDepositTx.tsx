import { FC, useState, useEffect } from 'react';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap, useDebounce } from '@hooks';
import {
  TokensSelectors,
  LabsSelectors,
  LabsActions,
  TokensActions,
  VaultsActions,
  VaultsSelectors,
  SettingsSelectors,
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
  formatPercent,
} from '@src/utils';

import { Transaction } from '../Transaction';
import { getConstants } from '../../../../../config/constants';

const isZapDisabled = (labAddress?: string) => {
  // TODO: DISABLE ZAPS THROUGH METADATA
  return false; // NO LAB ADDRESS DISABLED NOW
};

export interface LabDepositTxProps {
  onClose?: () => void;
}

export const LabDepositTx: FC<LabDepositTxProps> = ({ onClose }) => {
  const { YVBOOST, PSLPYVBOOSTETH } = getConstants().CONTRACT_ADDRESSES;
  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [amount, setAmount] = useState('');
  const [debouncedAmount, isDebouncePending] = useDebounce(amount, 500);
  const [txCompleted, setTxCompleted] = useState(false);
  const selectedLab = useAppSelector(LabsSelectors.selectSelectedLab);
  const selectedSellTokenAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  const userTokens = useAppSelector(TokensSelectors.selectUserTokens);
  const selectedSlippage = useAppSelector(SettingsSelectors.selectDefaultSlippage).toString();

  // TODO: ADD EXPECTED OUTCOME TO LABS
  const expectedTxOutcome = useAppSelector(VaultsSelectors.selectExpectedTxOutcome);
  const expectedTxOutcomeStatus = useAppSelector(VaultsSelectors.selectExpectedTxOutcomeStatus);
  const actionsStatus = useAppSelector(LabsSelectors.selectSelectedLabActionsStatusMap);

  const sellTokensOptions = isZapDisabled(selectedLab?.address)
    ? []
    : userTokens.filter(({ address }) => address !== selectedLab?.token.address);
  if (selectedLab) sellTokensOptions.unshift(selectedLab.token);
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
  }, [selectedSellTokenAddress]);

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

  if (!selectedLab || !selectedSellTokenAddress || !sellTokensOptions) {
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
  });

  const error = allowanceError || inputError || actionsStatus.approveDeposit.error || actionsStatus.deposit.error;

  const selectedLabOption = {
    address: selectedLab.address,
    symbol: selectedLab.displayName,
    icon: selectedLab.displayIcon,
    balance: selectedLab.DEPOSIT.userBalance,
    decimals: toBN(selectedLab.decimals).toNumber(),
    yield: formatPercent(selectedLab.apyData, 2),
  };

  const amountValue = toBN(amount).times(normalizeAmount(selectedSellToken.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = toBN(debouncedAmount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetUnderlyingTokenAmount, selectedLab?.token.decimals)
    : '';
  const expectedAmountValue = toBN(debouncedAmount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetTokenAmountUsdc, USDC_DECIMALS)
    : '0';
  const expectedAmountStatus = {
    error: expectedTxOutcomeStatus.error || error,
    loading: expectedTxOutcomeStatus.loading || isDebouncePending,
  };

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
          slippageTolerance: toBN(selectedSlippage).toNumber(),
        })
      );
      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: 'Approve',
      onAction: approve,
      status: actionsStatus.approveDeposit,
      disabled: isApproved,
    },
    {
      label: 'Deposit',
      onAction: deposit,
      status: actionsStatus.deposit,
      disabled: !isApproved || !isValidAmount || expectedTxOutcomeStatus.loading,
      contrast: true,
    },
  ];

  return (
    <Transaction
      transactionLabel="Invest"
      transactionCompleted={txCompleted}
      transactionCompletedLabel="Exit"
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader="From Wallet"
      sourceAssetOptions={sellTokensOptions}
      selectedSourceAsset={selectedSellToken}
      onSelectedSourceAssetChange={onSelectedSellTokenChange}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      onSourceAmountChange={setAmount}
      targetHeader="To Vault"
      targetAssetOptions={[selectedLabOption]}
      selectedTargetAsset={selectedLabOption}
      onSelectedTargetAssetChange={onSelectedLabChange}
      targetAmount={expectedAmount}
      targetAmountValue={expectedAmountValue}
      targetAmountStatus={expectedAmountStatus}
      actions={txActions}
      status={{ error }}
      onClose={onClose}
    />
  );
};
