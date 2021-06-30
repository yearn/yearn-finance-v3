import { FC } from 'react';
import styled from 'styled-components';

import { Modal } from '@components/common';

const StyledModalTx = styled(Modal)`
  /* gap: ${({ theme }) => theme.txModal.gap}; */
  /* background: ${({ theme }) => theme.colors.txModalColors.background}; */
  /* color: ${({ theme }) => theme.colors.txModalColors.text}; */
  /* border-radius: ${({ theme }) => theme.globalRadius}; */
  background: transparent;
  padding: 0;
  width: ${({ theme }) => theme.txModal.width};
  height: initial;
`;

export interface StyledModalTxProps {}

export const ModalTx: FC<StyledModalTxProps> = ({ children, ...props }) => {
  return <StyledModalTx {...props}>{children}</StyledModalTx>;
};
