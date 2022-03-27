import { FC } from 'react';
import styled from 'styled-components/macro';

import { ModalTx } from '@components/common';
import { LabDepositTx } from '@components/app';

const StyledLabDepositTxModal = styled(ModalTx)``;
export interface LabDepositTxModalProps {
  onClose: () => void;
}

export const LabDepositTxModal: FC<LabDepositTxModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledLabDepositTxModal {...props}>
      <LabDepositTx onClose={onClose} />
    </StyledLabDepositTxModal>
  );
};
