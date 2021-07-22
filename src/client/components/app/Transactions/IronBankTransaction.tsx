import { FC } from 'react';
import styled from 'styled-components';

import { TxActionButton, TxActions } from './components/TxActions';
import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxError } from './components/TxError';
import { TxStatus } from './components/TxStatus';
import { TxArrowStatus, TxArrowStatusTypes } from './components/TxArrowStatus';
import { TxBorrowLimit } from './components/TxBorrowLimit';

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

interface IronBankTransactionProps {
  transactionLabel: string;
  transactionCompleted: boolean;
  transactionCompletedLabel: string;
  onTransactionCompletedDismissed: () => void;
  assetHeader: string;
  asset: Asset;
  amount: string;
  amountValue?: string;
  onAmountChange?: (amount: string) => void;
  borrowBalance: string;
  proyectedBorrowBalance?: string;
  borrowLimit: string;
  proyectedBorrowLimit?: string;
  yieldType: 'SUPPLY' | 'BORROW';
  actions: Action[];
  status: Status;
  onClose?: () => void;
}

const StyledTransaction = styled(TxContainer)``;

export const IronBankTransaction: FC<IronBankTransactionProps> = (props) => {
  const {
    transactionLabel,
    transactionCompleted,
    transactionCompletedLabel,
    onTransactionCompletedDismissed,
    assetHeader,
    asset,
    amount,
    amountValue,
    onAmountChange,
    borrowBalance,
    proyectedBorrowBalance,
    borrowLimit,
    proyectedBorrowLimit,
    yieldType,
    actions,
    status,
    onClose,
  } = props;

  const assetBalance = normalizeAmount(asset.balance, asset.decimals);
  const yieldLabel = yieldType === 'SUPPLY' ? 'Supply APY' : 'Borrow APY';

  let txArrowStatus: TxArrowStatusTypes = 'preparing';

  if (actions.length && actions.length > 1) {
    if (!actions[0].disabled && !actions[0].status.loading) {
      txArrowStatus = 'preparing';
    } else if (actions[0].status.loading) {
      txArrowStatus = 'firstPending';
    } else if (!actions[1].status.loading) {
      txArrowStatus = 'secondPreparing';
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
        headerText={assetHeader}
        inputText={`Balance ${formatAmount(assetBalance, 4)} ${asset.symbol}`}
        amount={amount}
        onAmountChange={onAmountChange}
        amountValue={amountValue}
        maxAmount={onAmountChange ? assetBalance : undefined}
        selectedToken={asset}
        inputError={!!status.error}
        readOnly={!onAmountChange}
      />

      <TxBorrowLimit
        borrowBalance={borrowBalance}
        proyectedBorrowBalance={proyectedBorrowBalance}
        borrowLimit={borrowLimit}
        proyectedBorrowLimit={proyectedBorrowLimit}
        yieldLabel={yieldLabel}
        yieldPercent={asset.yield ?? ''}
      />

      {!status.error && <TxArrowStatus status={txArrowStatus} />}
      {status.error && <TxError errorText={status.error} />}

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
