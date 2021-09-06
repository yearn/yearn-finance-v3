import { FC } from 'react';
import styled from 'styled-components';

import { CheckRoundIcon, Text, Icon } from '@components/common';

import { TxActionButton, TxActions } from './TxActions';

const StyledIcon = styled(Icon)`
  width: 8.4rem;
  fill: inherit;
`;

const StyledText = styled(Text)`
  color: inherit;
  font-weight: 600;
  font-size: 2.4rem;
`;

const TxStatusContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.txModalColors.success};
  background: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
  border-radius: ${({ theme }) => theme.globalRadius};
  padding-top: 6.4rem;
  padding-bottom: 16.8rem;
  fill: currentColor;
  gap: 6.9rem;
`;

const StyledTxStatus = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

export interface TxStatusProps {
  exit: () => void;
}

export const TxStatus: FC<TxStatusProps> = ({ exit, children, ...props }) => {
  return (
    <StyledTxStatus {...props}>
      <TxStatusContent>
        <StyledText>Transaction completed</StyledText>

        <StyledIcon Component={CheckRoundIcon} />
      </TxStatusContent>

      <TxActions>
        <TxActionButton onClick={exit} success>
          Exit
        </TxActionButton>
      </TxActions>

      {children}
    </StyledTxStatus>
  );
};
