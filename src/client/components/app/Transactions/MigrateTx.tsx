import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap } from '@hooks';
import { VaultsSelectors, VaultsActions, TokensActions } from '@store';
import { toBN, normalizeAmount, USDC_DECIMALS, validateMigrateVaultAllowance, formatPercent } from '@utils';

import { Transaction } from './Transaction';

export interface MigrateTxProps {
  header?: string;
  onClose?: () => void;
}

export const MigrateTx: FC<MigrateTxProps> = ({ header, onClose }) => {
  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [txCompleted, setTxCompleted] = useState(false);
  const vaults = useAppSelector(VaultsSelectors.selectLiveVaults);
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const actionsStatus = useAppSelector(VaultsSelectors.selectSelectedVaultActionsStatusMap);

  const onExit = () => {
    dispatch(VaultsActions.clearSelectedVaultAndStatus());
  };

  useEffect(() => {
    return () => {
      // TODO Fix clear on vault details
      onExit();
    };
  }, []);

  useEffect(() => {
    if (!selectedVault || !selectedVault.migrationContract) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedVault.address,
        spenderAddress: selectedVault.migrationContract,
      })
    );
  }, []);

  if (!selectedVault || !selectedVault.migrationContract || !selectedVault.migrationTargetVault) return null;

  const amount = normalizeAmount(selectedVault.DEPOSIT.userDeposited, selectedVault.token.decimals);
  const amountValue = normalizeAmount(selectedVault.DEPOSIT.userDepositedUsdc, USDC_DECIMALS);
  const expectedAmount = amount;
  const expectedAmountValue = amountValue;

  const { approved: isApproved, error: allowanceError } = validateMigrateVaultAllowance({
    amount: toBN(amount),
    vaultAddress: selectedVault.address,
    vaultDecimals: selectedVault.decimals,
    vaultAllowancesMap: selectedVault.allowancesMap,
    migrationContractAddress: selectedVault.migrationContract,
  });

  const error = allowanceError || actionsStatus.approveMigrate.error || actionsStatus.migrate.error;

  const sourceVault = {
    address: selectedVault.address,
    symbol: selectedVault.displayName,
    icon: selectedVault.displayIcon,
    balance: selectedVault.DEPOSIT.userDeposited,
    balanceUsdc: selectedVault.DEPOSIT.userDepositedUsdc,
    decimals: selectedVault.token.decimals,
  };

  const targetVault = vaults
    .filter(({ address }) => selectedVault.migrationTargetVault === address)
    .map((vault) => ({
      address: vault.address,
      symbol: vault.displayName,
      icon: vault.displayIcon,
      balance: vault.DEPOSIT.userDeposited,
      balanceUsdc: vault.DEPOSIT.userDepositedUsdc,
      decimals: vault.token.decimals,
      yield: formatPercent(vault.apyData, 2),
    }))
    .pop()!;

  const loadingText = 'Calculating...';

  const onTransactionCompletedDismissed = () => {
    if (onClose) onClose();
  };

  const approve = async () => {
    await dispatch(
      VaultsActions.approveMigrate({
        vaultFromAddress: selectedVault.address,
        migrationContractAddress: selectedVault.migrationContract,
      })
    );
  };

  const migrate = async () => {
    try {
      await dispatchAndUnwrap(
        VaultsActions.migrateVault({
          vaultFromAddress: selectedVault.address,
          vaultToAddress: selectedVault.migrationTargetVault!,
        })
      );
      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: 'Approve',
      onAction: approve,
      status: actionsStatus.approveMigrate,
      disabled: isApproved,
    },
    {
      label: 'Migrate',
      onAction: migrate,
      status: actionsStatus.migrate,
      disabled: !isApproved,
      contrast: true,
    },
  ];

  return (
    <Transaction
      transactionLabel={header}
      transactionCompleted={txCompleted}
      transactionCompletedLabel="Exit"
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader="From vault"
      sourceAssetOptions={[sourceVault]}
      selectedSourceAsset={sourceVault}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      targetHeader="To vault"
      targetAssetOptions={[targetVault]}
      selectedTargetAsset={targetVault}
      targetAmount={expectedAmount}
      targetAmountValue={expectedAmountValue}
      targetAmountStatus={{}}
      actions={txActions}
      status={{ error }}
      loadingText={loadingText}
      onClose={onClose}
    />
  );
};
