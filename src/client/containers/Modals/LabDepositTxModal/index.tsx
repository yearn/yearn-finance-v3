import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { LabDepositTx } from '@components/app/Transactions';

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
