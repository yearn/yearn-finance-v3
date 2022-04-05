import { FC } from 'react';
import styled from 'styled-components/macro';

import { ModalTx } from '@components/common';
import { LabWithdrawTx } from '@components/app';

const StyledLabWithdrawTxModal = styled(ModalTx)``;
export interface LabWithdrawTxModalProps {
  onClose: () => void;
}

export const LabWithdrawTxModal: FC<LabWithdrawTxModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledLabWithdrawTxModal {...props}>
      <LabWithdrawTx onClose={onClose} />
    </StyledLabWithdrawTxModal>
  );
};
