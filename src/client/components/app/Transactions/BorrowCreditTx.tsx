import { FC, useState } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';

import {
  useAppTranslation,
  useAppDispatch,
  useSelectedCreditLine,

  // used to dummy token for dev
  useAppSelector,
  useSelectedSellToken,
} from '@hooks';
import { LinesSelectors, LinesActions } from '@store';

import { TxContainer } from './components/TxContainer';
import { TxCreditLineInput } from './components/TxCreditLineInput';
import { TxActionButton } from './components/TxActions';
import { TxActions } from './components/TxActions';
import { TxStatus } from './components/TxStatus';
import { TxTTLInput } from './components/TxTTLInput';

const StyledTransaction = styled(TxContainer)``;

const StyledAmountInput = styled(TxTTLInput)``;

interface BorrowCreditProps {
  header: string;
  onClose: () => void;
  acceptingOffer: boolean;
  onSelectedCreditLineChange: Function;
  allowVaultSelect: boolean;
  onPositionChange: (data: { credit?: string; amount?: string }) => void;
}

const RatesContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const BorrowCreditTx: FC<BorrowCreditProps> = (props) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const { allowVaultSelect, acceptingOffer, header, onClose, onPositionChange } = props;
  const [transactionCompleted, setTransactionCompleted] = useState(0);
  const [transactionApproved, setTransactionApproved] = useState(true);
  const [transactionLoading, setLoading] = useState(false);
  const [targetAmount, setTargetAmount] = useState('1');
  const selectedCredit = useAppSelector(LinesSelectors.selectSelectedLine);
  const setSelectedCredit = (lineAddress: string) => dispatch(LinesActions.setSelectedLineAddress({ lineAddress }));

  const _updatePosition = () =>
    onPositionChange({
      credit: selectedCredit?.id,
      amount: targetAmount,
    });

  // Event Handlers

  const onAmountChange = (amount: string): void => {
    setTargetAmount(amount);
    _updatePosition();
  };

  const onSelectedCreditLineChange = (addr: string): void => {
    console.log('select new loc', addr);
    setSelectedCredit(addr);
    _updatePosition();
  };

  const onTransactionCompletedDismissed = () => {
    if (onClose) {
      onClose();
    } else {
      setTransactionCompleted(0);
    }
  };

  const borrowCredit = () => {
    setLoading(true);
    // TODO set error in state to display no line selected
    if (!selectedCredit?.id || !targetAmount) {
      console.log('check this', selectedCredit?.id, targetAmount);
      setLoading(false);
      return;
    }

    dispatch(
      LinesActions.borrowCredit({
        lineAddress: selectedCredit.id,
        amount: ethers.utils.parseEther(targetAmount),
        dryRun: true,
      })
    ).then((res) => {
      if (res.meta.requestStatus === 'rejected') {
        setTransactionCompleted(2);
        console.log(transactionCompleted, 'tester');
        setLoading(false);
      }
      if (res.meta.requestStatus === 'fulfilled') {
        setTransactionCompleted(1);
        console.log(transactionCompleted, 'tester');
        setLoading(false);
      }
    });
  };

  const txActions = [
    {
      label: t('components.transaction.borrow'),
      onAction: borrowCredit,
      status: true,
      disabled: !transactionApproved,
      contrast: false,
    },
  ];

  if (!selectedCredit) return null;

  if (transactionCompleted === 1) {
    return (
      <StyledTransaction onClose={onClose} header={'transaction'}>
        <TxStatus
          success={transactionCompleted}
          transactionCompletedLabel={'completed'}
          exit={onTransactionCompletedDismissed}
        />
      </StyledTransaction>
    );
  }

  if (transactionCompleted === 2) {
    return (
      <StyledTransaction onClose={onClose} header={'transaction'}>
        <TxStatus
          success={transactionCompleted}
          transactionCompletedLabel={'could not borrow credit'}
          exit={onTransactionCompletedDismissed}
        />
      </StyledTransaction>
    );
  }

  return (
    <StyledTransaction onClose={onClose} header={header || t('components.transaction.borrow')}>
      <TxCreditLineInput
        key={'credit-input'}
        headerText={t('components.transaction.borrow-credit.select-line')}
        inputText={t('components.transaction.borrow-credit.select-line')}
        onSelectedCreditLineChange={onSelectedCreditLineChange}
        selectedCredit={selectedCredit}
        // creditOptions={sourceCreditOptions}
        // inputError={!!sourceStatus.error}
        readOnly={false}
        // displayGuidance={displaySourceGuidance}
      />
      <StyledAmountInput
        headerText={t('components.transaction.borrow-credit.select-amount')}
        inputText={t('')}
        inputError={false}
        amount={targetAmount}
        onAmountChange={onAmountChange}
        maxAmount={'0'}
        maxLabel={'Max'}
        readOnly={false}
        hideAmount={false}
        loading={false}
        loadingText={''}
        ttlType={false}
      />
      <TxActions>
        {txActions.map(({ label, onAction, status, disabled, contrast }) => (
          <TxActionButton
            key={label}
            data-testid={`modal-action-${label.toLowerCase()}`}
            onClick={onAction}
            disabled={disabled}
            contrast={contrast}
            isLoading={transactionLoading}
          >
            {label}
          </TxActionButton>
        ))}
      </TxActions>
    </StyledTransaction>
  );
};
