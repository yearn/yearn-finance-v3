import { FC, useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch, useAppDispatchAndUnwrap, useAppTranslation } from '@hooks';
import { VaultsSelectors, VaultsActions, TokensActions, NetworkSelectors, WalletSelectors } from '@store';
import {
  toBN,
  normalizeAmount,
  USDC_DECIMALS,
  validateMigrateVaultAllowance,
  validateNetwork,
  formatPercent,
} from '@utils';

import { Transaction } from './Transaction';

export interface MigrateTxProps {
  header?: string;
  onClose?: () => void;
}

export const MigrateTx: FC<MigrateTxProps> = ({ header, onClose }) => {
  const { t } = useAppTranslation('common');

  const dispatch = useAppDispatch();
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [txCompleted, setTxCompleted] = useState(false);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const isWalletConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const vaults = useAppSelector(VaultsSelectors.selectLiveVaults);
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const actionsStatus = useAppSelector(VaultsSelectors.selectSelectedVaultActionsStatusMap);
  const migrateToVault = vaults.find((vault) => vault.address === selectedVault?.migrationTargetVault);

  const onExit = () => {
    dispatch(VaultsActions.clearSelectedVaultAndStatus());
  };

  useEffect(() => {
    return () => {
      onExit();
    };
  }, []);

  useEffect(() => {
    if (!selectedVault || !selectedVault.migrationContract || !isWalletConnected) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedVault.address,
        spenderAddress: selectedVault.migrationContract,
      })
    );
  }, [selectedVault?.address, isWalletConnected]);

  if (!selectedVault || !selectedVault.migrationContract || !selectedVault.migrationTargetVault || !migrateToVault)
    return null;

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

  const { error: networkError } = validateNetwork({
    currentNetwork,
    walletNetwork,
  });

  const sourceError = networkError || allowanceError;
  const targetError = actionsStatus.approveMigrate.error || actionsStatus.migrate.error;

  const sourceVault = {
    address: selectedVault.address,
    symbol: selectedVault.token.symbol,
    icon: selectedVault.displayIcon,
    balance: selectedVault.DEPOSIT.userDeposited,
    balanceUsdc: selectedVault.DEPOSIT.userDepositedUsdc,
    decimals: selectedVault.token.decimals,
  };

  const targetVault = {
    address: selectedVault.migrationTargetVault,
    symbol: migrateToVault?.token.symbol ?? selectedVault.token.symbol,
    icon: migrateToVault?.displayIcon ?? selectedVault.displayIcon,
    balance: migrateToVault?.DEPOSIT.userDeposited ?? '0',
    balanceUsdc: migrateToVault?.DEPOSIT.userDepositedUsdc ?? '0',
    decimals: migrateToVault?.token.decimals ?? selectedVault.token.decimals,
    yield: migrateToVault?.apyData ? formatPercent(migrateToVault?.apyData, 2) : undefined,
  };

  const loadingText = t('components.transaction.status.calculating');
  // NOTE if there is no onClose then we are on vault details
  let transactionCompletedLabel;
  if (!onClose) {
    transactionCompletedLabel = t('components.transaction.status.done');
  }

  const onTransactionCompletedDismissed = () => {
    if (onClose) {
      onClose();
    } else {
      setTxCompleted(false);
      dispatch(VaultsActions.clearTransactionData());
    }
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
          migrationContractAddress: selectedVault.migrationContract!,
        })
      );
      setTxCompleted(true);
    } catch (error) {}
  };

  const txActions = [
    {
      label: t('components.transaction.approve'),
      onAction: approve,
      status: actionsStatus.approveMigrate,
      disabled: isApproved,
    },
    {
      label: t('components.transaction.migrate'),
      onAction: migrate,
      status: actionsStatus.migrate,
      disabled: !isApproved,
    },
  ];

  return (
    <Transaction
      transactionLabel={header}
      transactionCompleted={txCompleted}
      transactionCompletedLabel={transactionCompletedLabel}
      onTransactionCompletedDismissed={onTransactionCompletedDismissed}
      sourceHeader={t('components.transaction.from-vault')}
      sourceAssetOptions={[sourceVault]}
      selectedSourceAsset={sourceVault}
      sourceAmount={amount}
      sourceAmountValue={amountValue}
      targetHeader={t('components.transaction.to-vault')}
      targetAssetOptions={[targetVault]}
      selectedTargetAsset={targetVault}
      targetAmount={expectedAmount}
      targetAmountValue={expectedAmountValue}
      targetStatus={{ error: targetError }}
      actions={txActions}
      sourceStatus={{ error: sourceError }}
      loadingText={loadingText}
      onClose={onClose}
    />
  );
};
