import { FC, useState } from 'react';
import styled from 'styled-components';

import { Text } from '@components/common';

import { TxActionButton, TxActions, TxSpinnerLoading } from './components/TxActions';
import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxError } from './components/TxError';
import { TxArrowStatus } from './components/TxArrowStatus';

export interface TestTxProps {
  onClose?: () => void;
}

const StyledTestTx = styled(TxContainer)``;

export const TestTx: FC<TestTxProps> = ({ onClose, children, ...props }) => {
  return (
    <StyledTestTx onClose={onClose} header="Invest" {...props}>
      {/* <TxTokenInput headerText="From wallet" /> */}

      <TxArrowStatus />

      {/* <TxTokenInput headerText="To vault" /> */}

      <TxError errorText="Test error" />

      <TxActions>
        <TxActionButton onClick={() => console.log('approve')} disabled>
          Approve
        </TxActionButton>

        <TxActionButton onClick={() => console.log('deposit')}>Deposit</TxActionButton>

        <TxActionButton onClick={() => console.log('withdraw')} pending></TxActionButton>
      </TxActions>

      <TxActions>
        <TxActionButton onClick={() => console.log('exit')} success>
          Exit
        </TxActionButton>
      </TxActions>
    </StyledTestTx>
  );
};
