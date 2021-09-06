import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { LabWithdrawTx } from '@components/app/Transactions';

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
