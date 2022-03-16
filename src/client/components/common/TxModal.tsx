import { FC } from 'react';
import styled from 'styled-components';

import { Modal } from './Modal';

const StyledModalTx = styled(Modal)`
  background: transparent;
  padding: 0;
  width: ${({ theme }) => theme.txModal.width};
  height: initial;
`;

export interface StyledModalTxProps {
  onClose?: () => void;
}

export const ModalTx: FC<StyledModalTxProps> = ({ onClose, children, ...props }) => {
  return (
    <StyledModalTx onClose={onClose} {...props}>
      {children}
    </StyledModalTx>
  );
};
