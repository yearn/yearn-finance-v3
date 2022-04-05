import { FC } from 'react';
import styled from 'styled-components/macro';

import { Modal } from './Modal';

const StyledModalTx = styled(Modal)`
  background: transparent;
  padding: 0;
  width: ${({ theme }) => theme.txModal.width};
  height: initial;
`;

export interface StyledModalTxProps {}

export const ModalTx: FC<StyledModalTxProps> = ({ children, ...props }) => {
  return <StyledModalTx {...props}>{children}</StyledModalTx>;
};
