import { FC } from 'react';
import styled from 'styled-components/macro';

import { ProgressBar } from '@components/common';

import { TxActionButton, TxActions } from './components/TxActions';
import { TxContainer } from './components/TxContainer';
import { TxError } from './components/TxError';
export interface TestTxProps {
  onClose?: () => void;
}

const StyledTestTx = styled(TxContainer)``;

export const TestTx: FC<TestTxProps> = ({ onClose, children, ...props }) => {
  return (
    <StyledTestTx onClose={onClose} header="Invest" {...props}>
      {/* <TxTokenInput headerText="From wallet" /> */}

      {/* <TxTokenInput headerText="To vault" /> */}

      <ProgressBar value={2140} diffValue={3040} maxValue={5032} />
      <ProgressBar value={2140} diffValue={1540} maxValue={5032} />

      <TxError errorText="Test error" />

      <TxActions>
        <TxActionButton onClick={() => console.log('approve')} disabled>
          Approve
        </TxActionButton>

        <TxActionButton onClick={() => console.log('deposit')}>Deposit</TxActionButton>

        <TxActionButton onClick={() => console.log('withdraw')} contrast>
          Loading
        </TxActionButton>
      </TxActions>

      <TxActions>
        <TxActionButton onClick={() => console.log('exit')} success>
          Success
        </TxActionButton>
      </TxActions>
    </StyledTestTx>
  );
};
