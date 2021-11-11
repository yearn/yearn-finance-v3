import { FC } from 'react';
import styled from 'styled-components';

import { formatAmount, normalizeAmount } from '@utils';

import { TxActionButton, TxActions } from './components/TxActions';
import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxError } from './components/TxError';
import { TxStatus } from './components/TxStatus';
import { TxBorrowLimit } from './components/TxBorrowLimit';

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

interface IronBankTransactionProps {
  transactionLabel: string;
  transactionCompleted: boolean;
  transactionCompletedLabel: string;
  onTransactionCompletedDismissed: () => void;
  assetHeader: string;
  assetLabel: string;
  asset: Asset;
  amount: string;
  amountValue?: string;
  safeMax?: string;
  maxLabel?: string;
  onAmountChange: (amount: string) => void;
  borrowBalance: string;
  projectedBorrowBalance?: string;
  borrowLimit: string;
  projectedBorrowLimit?: string;
  borrowingTokens?: string;
  projectedBorrowingTokens?: string;
  yieldType: 'SUPPLY' | 'BORROW';
  actions: Action[];
  sourceStatus: Status;
  targetStatus: Status;
  onClose?: () => void;
}

const StyledTransaction = styled(TxContainer)``;

export const IronBankTransaction: FC<IronBankTransactionProps> = (props) => {
  const {
    transactionLabel,
    transactionCompleted,
    onTransactionCompletedDismissed,
    assetHeader,
    assetLabel,
    asset,
    amount,
    amountValue,
    safeMax,
    maxLabel,
    onAmountChange,
    borrowBalance,
    projectedBorrowBalance,
    borrowLimit,
    projectedBorrowLimit,
    borrowingTokens,
    projectedBorrowingTokens,
    yieldType,
    actions,
    sourceStatus,
    targetStatus,
    onClose,
  } = props;

  const assetBalance = normalizeAmount(asset.balance, asset.decimals);

  if (transactionCompleted) {
    return (
      <StyledTransaction onClose={onClose} header={transactionLabel} {...props}>
        <TxStatus exit={onTransactionCompletedDismissed} />
      </StyledTransaction>
    );
  }

  const generalStatus: Status = {
    loading: sourceStatus.loading || targetStatus.loading,
    error: sourceStatus.error || targetStatus.error,
  };

  return (
    <StyledTransaction onClose={onClose} header={transactionLabel} {...props}>
      <TxTokenInput
        headerText={assetHeader}
        inputText={`${assetLabel} ${formatAmount(assetBalance, 4)} ${asset.symbol}`}
        amount={amount}
        onAmountChange={onAmountChange}
        amountValue={amountValue}
        maxAmount={safeMax ?? assetBalance}
        maxLabel={maxLabel ?? (safeMax ? 'SAFE MAX' : 'MAX')}
        selectedToken={asset}
        inputError={!!sourceStatus.error}
        readOnly={!onAmountChange}
      />

      <TxBorrowLimit
        borrowBalance={borrowBalance}
        projectedBorrowBalance={projectedBorrowBalance}
        borrowLimit={borrowLimit}
        projectedBorrowLimit={projectedBorrowLimit}
        yieldType={yieldType}
        yieldPercent={asset.yield ?? ''}
        borrowingTokens={borrowingTokens}
        projectedBorrowingTokens={projectedBorrowingTokens}
        tokenSymbol={asset.symbol}
      />

      {generalStatus.error && <TxError errorText={generalStatus.error} />}

      <TxActions>
        {actions.map(({ label, onAction, status, disabled, contrast }) => (
          <TxActionButton
            key={label}
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
