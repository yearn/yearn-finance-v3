import { FC } from 'react';
import styled from 'styled-components';

import { Icon, WarningIcon } from '@components/common';

export interface TxErrorProps {
  errorText?: string;
}

const StyledTxError = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5rem;
  background-color: ${({ theme }) => theme.colors.txModalColors.error};
  color: ${({ theme }) => theme.colors.txModalColors.textContrast};
  padding: 2.1rem;
  font-weight: 500;
  font-size: 1.4rem;
  border-radius: ${({ theme }) => theme.globalRadius};
  text-transform: uppercase;

  ${Icon} {
    width: 4rem;
    fill: ${({ theme }) => theme.colors.txModalColors.textContrast};
    flex-shrink: 0;
  }
`;

export const TxError: FC<TxErrorProps> = ({ errorText, children, ...props }) => (
  <StyledTxError {...props}>
    <Icon Component={WarningIcon} />

    {errorText || 'Unknown error'}
  </StyledTxError>
);
