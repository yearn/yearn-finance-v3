import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { BackscratcherLockTx } from '@components/app/Transactions';

const StyledBackscratcherLockTxModal = styled(ModalTx)``;
export interface BackscratcherLockTxModalProps {
  onClose: () => void;
}

export const BackscratcherLockTxModal: FC<BackscratcherLockTxModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledBackscratcherLockTxModal {...props}>
      <BackscratcherLockTx onClose={onClose} />
    </StyledBackscratcherLockTxModal>
  );
};
