import { FC } from 'react';
import styled from 'styled-components';

import { formatAmount, normalizeAmount, toBN } from '@utils';
import { useAppTranslation } from '@hooks';

import { TxActionButton, TxActions } from './components/TxActions';
import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxError } from './components/TxError';
import { TxStatus } from './components/TxStatus';

interface Status {
  loading?: boolean;
  error?: string | null;
}

interface Action {
  label: string;
  onAction: () => void;
  status: Status;
  disabled?: boolean;
  contrast?: boolean;
}

interface Asset {
  address: string;
  symbol: string;
  icon?: string;
  balance: string;
  balanceUsdc: string;
  decimals: number;
  yield?: string;
}

interface TransactionProps {
  transactionLabel?: string;
  transactionCompleted: boolean;
  transactionCompletedLabel?: string;
  onTransactionCompletedDismissed: () => void;
  sourceHeader: string;
  sourceAssetOptions: Asset[];
  selectedSourceAsset: Asset;
  onSelectedSourceAssetChange?: (assetAddress: string) => void;
  sourceAmount: string;
  sourceAmountValue?: string;
  onSourceAmountChange?: (amount: string) => void;
  targetHeader: string;
  targetAssetOptions: Asset[];
  selectedTargetAsset: Asset;
  onSelectedTargetAssetChange?: (assetAddress: string) => void;
  targetAmountDisabled?: boolean;
  targetAmount: string;
  targetAmountValue?: string;
  targetStatus: Status;
  actions: Action[];
  sourceStatus: Status;
  loadingText?: string;
  onClose?: () => void;
}

const StyledTransaction = styled(TxContainer)``;

export const Transaction: FC<TransactionProps> = (props) => {
  const { t } = useAppTranslation('common');

  const {
    transactionLabel,
    transactionCompleted,
    transactionCompletedLabel,
    onTransactionCompletedDismissed,
    sourceHeader,
    sourceAssetOptions,
    selectedSourceAsset,
    onSelectedSourceAssetChange,
    sourceAmount,
    sourceAmountValue,
    onSourceAmountChange,
    targetHeader,
    targetAssetOptions,
    selectedTargetAsset,
    onSelectedTargetAssetChange,
    targetAmountDisabled,
    targetAmount,
    targetAmountValue,
    targetStatus,
    actions,
    sourceStatus,
    loadingText,
    onClose,
  } = props;

  const sourceBalance = normalizeAmount(selectedSourceAsset.balance, selectedSourceAsset.decimals);
  const targetBalance = normalizeAmount(selectedTargetAsset.balance, selectedTargetAsset.decimals);

  if (transactionCompleted) {
    return (
      <StyledTransaction onClose={onClose} header={transactionLabel}>
        <TxStatus transactionCompletedLabel={transactionCompletedLabel} exit={onTransactionCompletedDismissed} />
      </StyledTransaction>
    );
  }

  const outputLoading = toBN(sourceAmount).eq(0) ? false : targetStatus.loading;

  const generalStatus = {
    loading: sourceStatus.loading || targetStatus.loading,
    error: sourceStatus.error || targetStatus.error,
  };

  const sourceInputText = `${t('components.transaction.token-input.you-have')} ${formatAmount(sourceBalance, 4)} ${
    selectedSourceAsset.symbol
  }`;
  const targetInputText = `${t('components.transaction.token-input.you-have')} ${formatAmount(targetBalance, 4)} ${
    selectedTargetAsset.symbol
  }`;

  return (
    <StyledTransaction onClose={onClose} header={transactionLabel}>
      <TxTokenInput
        headerText={sourceHeader}
        inputText={sourceInputText}
        amount={sourceAmount}
        onAmountChange={onSourceAmountChange}
        amountValue={sourceAmountValue}
        maxAmount={onSourceAmountChange ? sourceBalance : undefined}
        selectedToken={selectedSourceAsset}
        tokenOptions={sourceAssetOptions}
        onSelectedTokenChange={onSelectedSourceAssetChange}
        inputError={!!sourceStatus.error}
        readOnly={!onSourceAmountChange}
      />

      <TxTokenInput
        headerText={targetHeader}
        inputText={targetInputText}
        amount={outputLoading || sourceStatus.error ? '' : targetAmount}
        amountValue={targetAmountValue}
        selectedToken={selectedTargetAsset}
        tokenOptions={targetAssetOptions}
        onSelectedTokenChange={onSelectedTargetAssetChange}
        yieldPercent={selectedTargetAsset.yield}
        inputError={!!targetStatus.error}
        readOnly
        hideAmount={targetAmountDisabled}
        loading={outputLoading}
        loadingText={loadingText ?? t('components.transaction.status.simulating')}
      />

      {generalStatus.error && <TxError errorType="warning" errorText={generalStatus.error} />}

      <TxActions>
        {actions.map(({ label, onAction, status, disabled, contrast }) => (
          <TxActionButton
            key={label}
            data-testid={`modal-action-${label.toLowerCase()}`}
            onClick={!status.loading ? onAction : undefined}
            disabled={disabled}
            contrast={contrast}
            isLoading={status.loading}
          >
            {label}
          </TxActionButton>
        ))}
      </TxActions>
    </StyledTransaction>
  );
};
