import { FC, useState } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';

import { useAppTranslation, useAppDispatch, useAppSelector } from '@hooks';
import { LinesSelectors, LinesActions, WalletSelectors } from '@store';
import { normalizeAmount } from '@src/utils';
import { PositionItem } from '@src/core/types';

import { TxContainer } from './components/TxContainer';
import { TxActionButton } from './components/TxActions';
import { TxActions } from './components/TxActions';
import { TxStatus } from './components/TxStatus';
import { TxTTLInput } from './components/TxTTLInput';
import { TxRateInput } from './components/TxRateInput';
import { TxPositionInput } from './components/TxPositionInput';

const StyledTransaction = styled(TxContainer)``;

const StyledAmountInput = styled(TxTTLInput)``;

interface BorrowCreditProps {
  header: string;
  onClose: () => void;
  acceptingOffer: boolean;
  onSelectedCreditLineChange: Function;
  onPositionChange: (data: { credit?: string; amount?: string }) => void;
}

export const BorrowCreditTx: FC<BorrowCreditProps> = (props) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const { header, onClose, onPositionChange } = props;
  const [transactionCompleted, setTransactionCompleted] = useState(0);
  const [transactionLoading, setLoading] = useState(false);
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const selectedPosition = useAppSelector(LinesSelectors.selectPositionData);
  const [targetAmount, setTargetAmount] = useState('1');
  const selectedCredit = useAppSelector(LinesSelectors.selectSelectedLine);
  const setSelectedCredit = (lineAddress: string) => dispatch(LinesActions.setSelectedLineAddress({ lineAddress }));
  const positions = useAppSelector(LinesSelectors.selectPositions);

  console.log('positions', positions);

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
    setSelectedCredit(addr);
    _updatePosition();
  };

  const onSelectedPositionChange = (arg: PositionItem): void => {
    dispatch(LinesActions.setSelectedLinePosition({ position: arg.id }));
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
    if (!selectedCredit?.id || !targetAmount || walletNetwork === undefined || selectedPosition === undefined) {
      setLoading(false);
      return;
    }

    dispatch(
      LinesActions.borrowCredit({
        line: selectedCredit.id,
        positionId: selectedPosition[0]['id'],
        amount: ethers.utils.parseEther(targetAmount),
        network: walletNetwork,
        dryRun: false,
      })
    ).then((res) => {
      if (res.meta.requestStatus === 'rejected') {
        setTransactionCompleted(2);
        setLoading(false);
      }
      if (res.meta.requestStatus === 'fulfilled') {
        setTransactionCompleted(1);
        setLoading(false);
      }
    });
  };

  const txActions = [
    {
      label: t('components.transaction.borrow'),
      onAction: borrowCredit,
      status: true,
      disabled: false,
      contrast: false,
    },
  ];

  if (!selectedCredit || selectedPosition === undefined) return null;

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
      <TxPositionInput
        key={'credit-input'}
        headerText={t('components.transaction.borrow-credit.select-line')}
        inputText={t('components.transaction.borrow-credit.select-line')}
        onSelectedPositionChange={onSelectedPositionChange}
        selectedPosition={selectedPosition[0]}
        positions={positions}
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
        maxAmount={normalizeAmount(selectedPosition[0]['deposit'], 18)}
        maxLabel={'Max'}
        readOnly={false}
        hideAmount={false}
        loading={false}
        loadingText={''}
        ttlType={false}
      />
      <TxRateInput
        key={'frate'}
        headerText={t('components.transaction.borrow-credit.your-rates')}
        frate={selectedPosition[0]['frate']}
        drate={selectedPosition[0]['drate']}
        amount={selectedPosition[0]['frate']}
        maxAmount={'100'}
        // setRateChange={onFrateChange}
        setRateChange={() => {}}
        readOnly={true}
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
