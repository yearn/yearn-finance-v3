import { FC, useState, useEffect } from 'react';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap } from '@hooks';
import { TokensSelectors, LabsSelectors, LabsActions, TokensActions, VaultsActions, VaultsSelectors } from '@store';
import {
  toBN,
  formatPercent,
  normalizeAmount,
  toWei,
  USDC_DECIMALS,
  validateVaultDeposit,
  validateVaultAllowance,
} from '@src/utils';
import { getConfig } from '@config';

import { Transaction } from '../Transaction';

export interface LabDepositTxProps {
  onClose?: () => void;
}

export const LabDepositTx: FC<LabDepositTxProps> = ({ onClose, children, ...props }) => {
  const { SLIPPAGE_OPTIONS } = getConfig();
  const slippageOptions = SLIPPAGE_OPTIONS.map((value) => ({
    value: value.toString(),
    label: formatPercent(value.toString(), 0),
  }));
  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [amount, setAmount] = useState('');
  const [txCompleted, setTxCompleted] = useState(false);
  const selectedLab = useAppSelector(LabsSelectors.selectSelectedLab);
  const selectedSellTokenAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  const userTokens = useAppSelector(TokensSelectors.selectUserTokens);
  const [selectedSlippage, setSelectedSlippage] = useState(slippageOptions[0]);
  // TODO: ADD EXPECTED OUTCOME TO LABS
  const expectedTxOutcome = useAppSelector(VaultsSelectors.selectExpectedTxOutcome);
  const expectedTxOutcomeStatus = useAppSelector(VaultsSelectors.selectExpectedTxOutcomeStatus);
  const actionsStatus = useAppSelector(LabsSelectors.selectSelectedLabActionsStatusMap);

  const sellTokensOptions = selectedLab
    ? [selectedLab.token, ...userTokens.filter(({ address }) => address !== selectedLab.token.address)]
    : userTokens;
  const sellTokensOptionsMap = keyBy(sellTokensOptions, 'address');
  const selectedSellToken = sellTokensOptionsMap[selectedSellTokenAddress ?? ''];

  useEffect(() => {
    if (!selectedSellTokenAddress && selectedLab) {
      dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: selectedLab.token.address }));
    }

    return () => {
      // TODO: CREATE A CLEAR SELECTED LAB/TOKEN ADDRESS ACTION
      dispatch(LabsActions.setSelectedLabAddress({ labAddress: undefined }));
      dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: undefined }));
    };
  }, []);

  useEffect(() => {
    if (!selectedLab || !selectedSellTokenAddress) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedSellTokenAddress,
        spenderAddress: selectedLab.address,
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
      LabsActions.yvBoost.yvBoostApproveDeposit({
        labAddress: selectedLab.address,
        sellTokenAddress: selectedSellToken.address,
      })
    );
  };

  const deposit = async () => {
    try {
      await dispatchAndUnwrap(
        LabsActions.yvBoost.yvBoostDeposit({
          labAddress: selectedLab.address,
          sellTokenAddress: selectedSellToken.address,
          amount: toBN(amount),
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
    },
  ];

  return (
    <Transaction
      transactionLabel="Invest"
      transactionCompleted={txCompleted}
      transactionCompletedLabel="Exit"
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader="From wallet"
      sourceAssetOptions={sellTokensOptions}
      selectedSourceAsset={selectedSellToken}
      onSelectedSourceAssetChange={onSelectedSellTokenChange}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      onSourceAmountChange={setAmount}
      targetHeader="To vault"
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
