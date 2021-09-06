import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { DepositTx } from '@components/app/Transactions';

const StyledDepositTxModal = styled(ModalTx)``;
export interface DepositTxModalProps {
  onClose: () => void;
}

export const DepositTxModal: FC<DepositTxModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledDepositTxModal {...props}>
      <DepositTx header="Invest" onClose={onClose} />
    </StyledDepositTxModal>
  );
};
