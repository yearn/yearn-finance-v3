import { FC } from 'react';

import { Box, Button, Dropdown } from '@components/common';
import { formatAmount, normalizeAmount } from '@utils';
import { useAppTranslation } from '@src/client/hooks';

import { AmountInput } from '../AmountInput';

import { TxContainer } from './components/TxContainer';
import { Action, Asset, Status } from './Transaction';
import { TxStatus } from './components/TxStatus';
import { TxError } from './components/TxError';

interface SimpleTransactionProps {
  actions: Action[];
  amount: string;
  header: string;
  selectedAsset: Asset;
  status: Status;
  transactionCompleted: boolean;
  transactionCompletedLabel?: string;
  transactionLabel?: string;
  onAmountChange?: (amount: string) => void;
  onClose?: () => void;
  onSelectedAssetChange?: (assetAddress: string) => void;
  onTransactionCompletedDismissed: () => void;
}

export const SimpleTransaction: FC<SimpleTransactionProps> = (props) => {
  const { t } = useAppTranslation('common');
  const {
    actions,
    amount,
    header,
    selectedAsset,
    status,
    transactionCompleted,
    transactionCompletedLabel,
    transactionLabel,
    onAmountChange,
    onTransactionCompletedDismissed,
    onClose,
  } = props;

  if (transactionCompleted) {
    return (
      <TxContainer onClose={onClose} header={transactionLabel}>
        <TxStatus transactionCompletedLabel={transactionCompletedLabel} exit={onTransactionCompletedDismissed} />
      </TxContainer>
    );
  }

  const balance = normalizeAmount(selectedAsset.balance, selectedAsset.decimals);

  const amountInputMessage = `${t('dashboard.available')}: ${formatAmount(onAmountChange ? balance : '0', 8)} ${
    selectedAsset.symbol
  }`;

  return (
    <TxContainer onClose={onClose} header={header}>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gridColumnGap={'2.4rem'}>
        <Dropdown
          label={'Choose token'} // TODO: Add translation
          selected={{ key: selectedAsset.symbol, value: selectedAsset.symbol }}
          items={[{ key: selectedAsset.symbol, value: selectedAsset.symbol }]}
          mt={'2.4rem'}
          fullWidth
        />

        <AmountInput
          label={'Amount'} // TODO: Add translation
          amount={amount}
          onAmountChange={onAmountChange}
          maxAmount={onAmountChange ? balance : undefined}
          message={amountInputMessage}
          mt={'2.4rem'}
        />

        {actions.map(({ label, onAction, status, disabled }) => (
          <Button
            key={label}
            data-testid={`modal-action-${label.toLowerCase()}`}
            onClick={!status.loading ? onAction : undefined}
            disabled={disabled}
            isLoading={status.loading}
            height={'5.6rem'}
            mt={'2.4rem'}
            filled
          >
            {label}
          </Button>
        ))}
      </Box>
      {status.error && <TxError errorType="warning" errorTitle={status.error} />}
    </TxContainer>
  );
};
