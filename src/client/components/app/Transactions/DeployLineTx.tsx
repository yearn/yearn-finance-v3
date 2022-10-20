import { FC, useState } from 'react';
import styled from 'styled-components';

import { isAddress } from '@utils';
import { useAppTranslation, useAppDispatch, useAppSelector } from '@hooks';
import { LinesActions, WalletSelectors } from '@store';

import { TxContainer } from './components/TxContainer';
import { TxAddressInput } from './components/TxAddressInput';
import { TxTTLInput } from './components/TxTTLInput';
import { TxActions } from './components/TxActions';
import { TxActionButton } from './components/TxActions';
import { TxStatus } from './components/TxStatus';

const StyledTransaction = styled(TxContainer)``;

interface DeployLineProps {
  header: string;
  onClose: () => void;
  allowVaultSelect: boolean;
  onPositionChange: (data: {
    credit?: string;
    token?: string;
    amount?: string;
    drate?: string;
    frate?: string;
  }) => void;
}

export const DeployLineTx: FC<DeployLineProps> = (props) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const [transactionCompleted, setTransactionCompleted] = useState(0);
  const { header, onClose } = props;
  const [borrower, setBorrower] = useState('');
  const [inputAddressWarning, setWarning] = useState('');
  const [inputTTLWarning, setTTLWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeToLive, setTimeToLive] = useState('0');

  const onAmountChange = (ttl: string) => {
    let timeToLive = +ttl * 24 * 60 * 60;
    setTimeToLive(timeToLive.toString());
  };

  const onTransactionCompletedDismissed = () => {
    if (onClose) {
      onClose();
    } else {
      setTransactionCompleted(0);
    }
  };

  const onBorrowerChange = (address: string) => {
    setBorrower(address);
  };

  const deploySecuredLineNoConfig = async () => {
    setLoading(true);
    let checkSumAddress = await isAddress(borrower);

    if (!checkSumAddress || walletNetwork === undefined) {
      setWarning('Incorrect address, please verify and try again.');
      console.log('error', inputAddressWarning);
      return;
    }

    if (+timeToLive <= 0) {
      setTTLWarning('Increase TTL, cannot be 0.');
      console.log('error', inputTTLWarning);
      return;
    }

    try {
      dispatch(LinesActions.deploySecuredLine({ borrower, ttl: timeToLive, network: walletNetwork })).then((res) => {
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
    } catch (e) {
      console.log(e);
    }
  };

  if (transactionCompleted === 1) {
    return (
      <StyledTransaction onClose={onClose} header={'Transaction complete'}>
        {console.log(transactionCompleted)}
        <TxStatus
          success={transactionCompleted}
          transactionCompletedLabel={'deployed line successfully'}
          exit={onTransactionCompletedDismissed}
        />
      </StyledTransaction>
    );
  }

  if (transactionCompleted === 2) {
    return (
      <StyledTransaction onClose={onClose} header={'Transaction failed'}>
        {console.log(transactionCompleted)}
        <TxStatus
          success={transactionCompleted}
          transactionCompletedLabel={'Could not deploy line'}
          exit={onTransactionCompletedDismissed}
        />
      </StyledTransaction>
    );
  }

  return (
    <StyledTransaction onClose={onClose} header={header || t('components.transaction.title')}>
      <TxAddressInput
        key={'credit-input'}
        headerText={t('components.transaction.deploy-line.select-borrower')}
        inputText={t('components.transaction.deploy-line.select-borrower')}
        onBorrowerChange={onBorrowerChange}
        borrower={borrower}
        // creditOptions={sourceCreditOptions}
        // inputError={!!sourceStatus.error}
        readOnly={false}
        // displayGuidance={displaySourceGuidance}
      />
      {inputAddressWarning !== '' ? <div style={{ color: '#C3272B' }}>{inputAddressWarning}</div> : ''}
      <TxTTLInput
        headerText={t('components.transaction.deploy-line.select-ttl')}
        inputText={t('components.transaction.deploy-line.time-to-live')}
        inputError={false}
        amount={timeToLive}
        onAmountChange={onAmountChange}
        maxAmount={'360'}
        maxLabel={'Max'}
        readOnly={false}
        hideAmount={false}
        loading={false}
        loadingText={''}
        ttlType={true}
      />
      {inputTTLWarning !== '' ? <div style={{ color: '#C3272B' }}>{inputTTLWarning}</div> : ''}
      <TxActions>
        <TxActionButton
          key={''}
          onClick={deploySecuredLineNoConfig}
          disabled={false}
          contrast={false}
          isLoading={loading}
        >
          {'Deploy Line'}
        </TxActionButton>
      </TxActions>
    </StyledTransaction>
  );
};
