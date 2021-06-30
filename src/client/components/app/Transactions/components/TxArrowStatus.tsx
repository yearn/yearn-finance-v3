import { FC } from 'react';
import styled from 'styled-components';

import { Icon, StatusArrowIcon } from '@components/common';

export type TxArrowStatusTypes = 'preparing' | 'pending' | 'loading' | 'success';

export interface TxArrowStatusProps {
  status?: TxArrowStatusTypes;
}

const StyledTxArrowStatus = styled.div<{ status?: TxArrowStatusTypes }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;

  ${Icon} {
    height: 4.9rem;
    fill: ${({ theme }) => theme.colors.txModalColors.text};
    flex-shrink: 0;
  }
`;

export const TxArrowStatus: FC<TxArrowStatusProps> = ({ status, children, ...props }) => (
  <StyledTxArrowStatus status={status} {...props}>
    <Icon Component={StatusArrowIcon} />
  </StyledTxArrowStatus>
);
