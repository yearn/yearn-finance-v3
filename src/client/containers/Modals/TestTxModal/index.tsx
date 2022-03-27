import { FC } from 'react';
import styled from 'styled-components/macro';

import { ModalTx } from '@components/common';
import { TestTx } from '@components/app';

const StyledTestTxModal = styled(ModalTx)``;
export interface TestTxModalProps {
  onClose: () => void;
}

export const TestTxModal: FC<TestTxModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledTestTxModal {...props}>
      <TestTx onClose={onClose} />
    </StyledTestTxModal>
  );
};
