import { FC } from 'react';
import styled from 'styled-components';

export interface TxStatusProps {}

const StyledTxStatus = styled.div`
  display: flex;
`;

export const TxStatus: FC<TxStatusProps> = ({ children, ...props }) => (
  <StyledTxStatus {...props}>Status test{children}</StyledTxStatus>
);
