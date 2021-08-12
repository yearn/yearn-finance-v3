import { FC, useState, useEffect } from 'react';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap } from '@hooks';
import { TokensSelectors, VaultsSelectors, VaultsActions, TokensActions, SettingsSelectors } from '@store';
import {
  toBN,
  normalizeAmount,
  toWei,
  USDC_DECIMALS,
  validateVaultDeposit,
  validateVaultAllowance,
  getZapInContractAddress,
  formatPercent,
} from '@src/utils';

import { Transaction } from './Transaction';
import { useDebounce } from '../../../hooks/useDebounce';

export interface DepositTxProps {
  header?: string;
  onClose?: () => void;
}

export const DepositTx: FC<DepositTxProps> = ({ header, onClose, children, ...props }) => {
  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [allowVaultSelect, setAllowVaultSelect] = useState(false);
  const [amount, setAmount] = useState('');
  const [txCompleted, setTxCompleted] = useState(false);
  const vaults = useAppSelector(VaultsSelectors.selectVaults);
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const selectedSellTokenAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  const userTokens = useAppSelector(TokensSelectors.selectUserTokens);
  const selectedSlippage = useAppSelector(SettingsSelectors.selectDefaultSlippage).toString();
  const expectedTxOutcome = useAppSelector(VaultsSelectors.selectExpectedTxOutcome);
  const expectedTxOutcomeStatus = useAppSelector(VaultsSelectors.selectExpectedTxOutcomeStatus);
  const actionsStatus = useAppSelector(VaultsSelectors.selectSelectedVaultActionsStatusMap);

  const debouncedAmount = useDebounce(amount, 500);

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
      setAllowVaultSelect(true);
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
  }, [amount, selectedSellTokenAddress, selectedVault]);

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

  if (!selectedVault || !selectedSellTokenAddress || !sellTokensOptions) {
    return null;
  }

  const { approved: isApproved, error: allowanceError } = validateVaultAllowance({
    amount: toBN(amount),
    vaultAddress: selectedVault.address,
    vaultUnderlyingTokenAddress: selectedVault.token.address,
    sellTokenAddress: selectedSellTokenAddress,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    sellTokenAllowancesMap: selectedSellToken.allowancesMap,
  });

  const { approved: isValidAmount, error: inputError } = validateVaultDeposit({
    sellTokenAmount: toBN(amount),
    depositLimit: selectedVault.depositLimit,
    emergencyShutdown: selectedVault.emergencyShutdown,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    userTokenBalance: selectedSellToken.balance,
    vaultUnderlyingBalance: selectedVault.vaultBalance,
  });

  // TODO: NEED A CLEAR ERROR ACTION ON MODAL UNMOUNT
  const error = allowanceError || inputError || actionsStatus.approve.error || actionsStatus.deposit.error;

  const vaultsOptions = vaults
    .filter(({ address }) => allowVaultSelect || selectedVault.address === address)
    .map(({ address, displayName, displayIcon, DEPOSIT, token, apyData }) => ({
      address,
      symbol: displayName,
      icon: displayIcon,
      balance: DEPOSIT.userDeposited,
      decimals: token.decimals,
      yield: formatPercent(apyData, 2),
    }));
  const selectedVaultOption = vaultsOptions.find(({ address }) => address === selectedVault.address)!;

  const amountValue = toBN(amount).times(normalizeAmount(selectedSellToken.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = toBN(amount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetUnderlyingTokenAmount, selectedVault?.token.decimals)
    : '';
  const expectedAmountValue = normalizeAmount(expectedTxOutcome?.targetTokenAmountUsdc, USDC_DECIMALS);

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
      status: actionsStatus.approve,
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
      transactionLabel={header}
      transactionCompleted={txCompleted}
      transactionCompletedLabel="Exit"
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader="From wallet"
      sourceAssetOptions={allowVaultSelect ? [selectedSellToken] : sellTokensOptions}
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
      targetAmountStatus={expectedTxOutcomeStatus}
      actions={txActions}
      status={{ error }}
      onClose={onClose}
    />
  );
};
