import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';

import { formatAmount, normalizeAmount, toBN } from '@utils';
import {
  useAppTranslation,
  useAppDispatch,

  // used to dummy token for dev
  useAppSelector,
  useSelectedSellToken,
} from '@hooks';
import { getConstants } from '@src/config/constants';
import { useSelectedCreditLine } from '@hooks';
import { AggregatedCreditLine } from '@src/core/types';
import { LinesActions } from '@store';

import { TxContainer } from './components/TxContainer';
import { TxCreditLineInput } from './components/TxCreditLineInput';
import { TxTTLInput } from './components/TxTTLInput';
import { TxActions } from './components/TxActions';
import { TxActionButton } from './components/TxActions';
import { TxStatus } from './components/TxStatus';

const {
  CONTRACT_ADDRESSES: { DAI },
  MAX_INTEREST_RATE,
} = getConstants();
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
  const [selectedCredit, setSelectedCredit] = useSelectedCreditLine();
  const [transactionCompleted, setTransactionCompleted] = useState(false);
  const { allowVaultSelect, header, onClose, onPositionChange } = props;
  const [borrower, setBorrower] = useState('0x1A6784925814a13334190Fd249ae0333B90b6443');

  const [timeToLive, setTimeToLive] = useState('0');

  const onAmountChange = (ttl: string) => {
    let timeToLive = +ttl * 24 * 60 * 60;
    setTimeToLive(timeToLive.toString());
  };

  const deploySecuredLineNoConfig = () => {
    try {
      dispatch(LinesActions.deploySecuredLine({ borrower, ttl: timeToLive })).then((res) => {
        console.log('working ', res);
        setTransactionCompleted(true);
      });
    } catch (e) {
      console.log(e);
    }
  };

  if (transactionCompleted) {
    return (
      <StyledTransaction onClose={onClose} header={''}>
        <TxStatus transactionCompletedLabel={''} exit={() => {}} />
      </StyledTransaction>
    );
  }

  return (
    <StyledTransaction onClose={onClose} header={header || t('components.transaction.title')}>
      <TxCreditLineInput
        key={'credit-input'}
        headerText={t('components.transaction.deploy-line.select-borrower')}
        inputText={t('components.transaction.deploy-line.select-borrower')}
        onSelectedCreditLineChange={() => {}}
        selectedCredit={selectedCredit as AggregatedCreditLine}
        // creditOptions={sourceCreditOptions}
        // inputError={!!sourceStatus.error}
        readOnly={false}
        // displayGuidance={displaySourceGuidance}
      />
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
      />
      <TxActions>
        <TxActionButton
          key={''}
          onClick={deploySecuredLineNoConfig}
          disabled={false}
          contrast={false}
          isLoading={false}
        >
          {'Deploy Line'}
        </TxActionButton>
      </TxActions>
    </StyledTransaction>
  );
};
