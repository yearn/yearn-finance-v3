import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { WithdrawTx } from '@components/app/Transactions';

const StyledWithdrawTxModal = styled(ModalTx)``;
export interface WithdrawTxModalProps {
  onClose: () => void;
}

export const WithdrawTxModal: FC<WithdrawTxModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledWithdrawTxModal {...props}>
      <WithdrawTx onClose={onClose} />
    </StyledWithdrawTxModal>
  );
};
