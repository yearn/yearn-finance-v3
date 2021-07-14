import { FC, useState, useEffect } from 'react';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap } from '@hooks';
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
} from '@src/utils';

import { Transaction } from '../Transaction';

const isZapDisabled = (labAddress?: string) => {
  // TODO: DISABLE ZAPS THROUGH METADATA
  return false; // NO LAB ADDRESS DISABLED NOW
};

export interface LabDepositTxProps {
  onClose?: () => void;
}

export const LabDepositTx: FC<LabDepositTxProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [amount, setAmount] = useState('');
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
      dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: selectedLab.token.address }));
    }

    return () => {
      onExit();
    };
  }, []);

  useEffect(() => {
    if (!selectedLab || !selectedSellTokenAddress) return;

    const isZap = selectedSellTokenAddress === selectedLab.token.address;
    const spenderAddress = isZap ? getZapInContractAddress(selectedLab.token.address) : selectedLab.address;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedSellTokenAddress,
        spenderAddress,
      })
    );
  }, [selectedSellTokenAddress]);

  // TODO: SET LABS SIMULATION
  useEffect(() => {
    if (!selectedLab || !selectedSellTokenAddress) return;

    if (toBN(amount).gt(0)) {
      dispatch(
        VaultsActions.getExpectedTransactionOutcome({
          transactionType: 'DEPOSIT',
          sourceTokenAddress: selectedSellTokenAddress,
          sourceTokenAmount: toWei(amount, selectedSellToken.decimals),
          targetTokenAddress: selectedLab.address,
        })
      );
    }
  }, [amount, selectedSellTokenAddress, selectedLab]);

  if (!selectedLab || !selectedSellTokenAddress || !sellTokensOptions) {
    return null;
  }

  // TODO: USE LAB VALIDATIONS
  const { approved: isApproved, error: allowanceError } = validateVaultAllowance({
    amount: toBN(amount),
    vaultAddress: selectedLab.address,
    vaultUnderlyingTokenAddress: selectedLab.token.address,
    sellTokenAddress: selectedSellTokenAddress,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    sellTokenAllowancesMap: selectedSellToken.allowancesMap,
  });

  const { approved: isValidAmount, error: inputError } = validateVaultDeposit({
    sellTokenAmount: toBN(amount),
    depositLimit: '0',
    emergencyShutdown: false,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    userTokenBalance: selectedSellToken.balance,
    vaultUnderlyingBalance: selectedLab.labBalance,
  });

  // TODO: NEED A CLEAR ERROR ACTION ON MODAL UNMOUNT
  const error = allowanceError || inputError || actionsStatus.approveDeposit.error || actionsStatus.deposit.error;

  const selectedLabOption = {
    address: selectedLab.address,
    symbol: selectedLab.name,
    icon: selectedLab.icon,
    balance: selectedLab.DEPOSIT.userBalance,
    decimals: toBN(selectedLab.decimals).toNumber(),
  };

  const amountValue = toBN(amount).times(normalizeAmount(selectedSellToken.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = toBN(amount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetUnderlyingTokenAmount, selectedLab?.token.decimals)
    : '';
  const expectedAmountValue = toBN(expectedAmount)
    .times(normalizeAmount(selectedLab.token.priceUsdc, USDC_DECIMALS))
    .toString();

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
      disabled: !isApproved || !isValidAmount,
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
      targetAmountStatus={expectedTxOutcomeStatus}
      actions={txActions}
      status={{ error }}
      onClose={onClose}
    />
  );
};
