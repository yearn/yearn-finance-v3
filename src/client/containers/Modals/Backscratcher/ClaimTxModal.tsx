import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { BackscratcherClaimTx } from '@components/app/Transactions';

const StyledBackscratcherClaimTxModal = styled(ModalTx)``;
export interface BackscratcherClaimTxModalProps {
  onClose: () => void;
}

export const BackscratcherClaimTxModal: FC<BackscratcherClaimTxModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledBackscratcherClaimTxModal {...props}>
      <BackscratcherClaimTx onClose={onClose} />
    </StyledBackscratcherClaimTxModal>
  );
};
