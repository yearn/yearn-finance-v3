import { FC } from 'react';
import styled from 'styled-components';

import { TxActionButton, TxActions } from './components/TxActions';
import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxError } from './components/TxError';
import { TxStatus } from './components/TxStatus';
import { TxArrowStatus, TxArrowStatusTypes } from './components/TxArrowStatus';

import { formatAmount, normalizeAmount } from '@src/utils';

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
  decimals: number;
  yield?: string;
}

interface TransactionProps {
  transactionLabel: string;
  transactionCompleted: boolean;
  transactionCompletedLabel: string;
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
  targetAmount: string;
  targetAmountValue?: string;
  targetAmountStatus: Status;
  actions: Action[];
  status: Status;
  onClose?: () => void;
}

const StyledTransaction = styled(TxContainer)``;

export const Transaction: FC<TransactionProps> = (props) => {
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
    targetAmount,
    targetAmountValue,
    targetAmountStatus,
    actions,
    status,
    onClose,
  } = props;

  const sourceBalance = normalizeAmount(selectedSourceAsset.balance, selectedSourceAsset.decimals);
  const targetBalance = normalizeAmount(selectedTargetAsset.balance, selectedTargetAsset.decimals);

  let txArrowStatus: TxArrowStatusTypes = 'preparing';

  if (actions.length && actions.length > 1) {
    if (!actions[0].disabled && !actions[0].status.loading) {
      txArrowStatus = 'preparing';
      if (targetAmountStatus.loading) txArrowStatus = 'firstPending';
    } else if (actions[0].status.loading) {
      txArrowStatus = 'firstPending';
    } else if (!actions[1].status.loading) {
      txArrowStatus = 'secondPreparing';
      if (targetAmountStatus.loading) txArrowStatus = 'firstPending';
    } else if (actions[1].status.loading) {
      txArrowStatus = 'secondPending';
    }
  }

  if (transactionCompleted) {
    return (
      <StyledTransaction onClose={onClose} header={transactionLabel} {...props}>
        <TxStatus exit={onTransactionCompletedDismissed} />
      </StyledTransaction>
    );
  }

  return (
    <StyledTransaction onClose={onClose} header={transactionLabel} {...props}>
      <TxTokenInput
        headerText={sourceHeader}
        inputText={`Balance ${formatAmount(sourceBalance, 4)} ${selectedSourceAsset.symbol}`}
        amount={sourceAmount}
        onAmountChange={onSourceAmountChange}
        amountValue={sourceAmountValue}
        maxAmount={onSourceAmountChange ? sourceBalance : undefined}
        selectedToken={selectedSourceAsset}
        tokenOptions={sourceAssetOptions}
        onSelectedTokenChange={onSelectedSourceAssetChange}
        inputError={!!status.error}
        readOnly={!onSourceAmountChange}
      />

      {!status.error && <TxArrowStatus status={txArrowStatus} />}
      {status.error && <TxError errorText={status.error} />}

      <TxTokenInput
        headerText={targetHeader}
        inputText={`Balance ${formatAmount(targetBalance, 4)} ${selectedTargetAsset.symbol}`}
        amount={targetAmount}
        amountValue={targetAmountValue}
        selectedToken={selectedTargetAsset}
        tokenOptions={targetAssetOptions}
        onSelectedTokenChange={onSelectedTargetAssetChange}
        yieldPercent={selectedTargetAsset.yield}
        readOnly
      />

      <TxActions>
        {actions.map(({ label, onAction, status, disabled, contrast }) => (
          <TxActionButton
            key={label}
            onClick={onAction}
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
