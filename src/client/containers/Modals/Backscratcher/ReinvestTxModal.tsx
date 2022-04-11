import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { BackscratcherReinvestTx } from '@components/app';

const StyledBackscratcherReinvestTxModal = styled(ModalTx)``;
export interface BackscratcherReinvestTxModalProps {
  onClose: () => void;
}

export const BackscratcherReinvestTxModal: FC<BackscratcherReinvestTxModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledBackscratcherReinvestTxModal {...props}>
      <BackscratcherReinvestTx onClose={onClose} />
    </StyledBackscratcherReinvestTxModal>
  );
};
