import { FC } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';

import { ModalTx } from '@components/common';
import { DepositTx } from '@components/app/Transactions';

const StyledDepositTxModal = styled(ModalTx)``;
export interface DepositTxModalProps {
  onClose: () => void;
}

export const DepositTxModal: FC<DepositTxModalProps> = ({ onClose, ...props }) => {
  const location = useLocation();

  const path = location.pathname.toLowerCase().split('/')[1];
  let allowTokenSelect = true;
  let allowVaultSelect = false;

  if (path === 'wallet') {
    allowTokenSelect = false;
    allowVaultSelect = true;
  }

  return (
    <StyledDepositTxModal {...props}>
      <DepositTx
        header="Invest"
        allowTokenSelect={allowTokenSelect}
        allowVaultSelect={allowVaultSelect}
        onClose={onClose}
      />
    </StyledDepositTxModal>
  );
};
