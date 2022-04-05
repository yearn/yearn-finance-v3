import { FC } from 'react';
import styled from 'styled-components/macro';

import { useAppTranslation } from '@hooks';
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
  transactionCompletedLabel?: string;
  exit: () => void;
}

export const TxStatus: FC<TxStatusProps> = ({ transactionCompletedLabel, exit, children, ...props }) => {
  const { t } = useAppTranslation('common');

  const actionButtonLabel = transactionCompletedLabel ?? t('components.transaction.status.exit');

  return (
    <StyledTxStatus {...props}>
      <TxStatusContent>
        <StyledText>{t('components.transaction.status.transaction-completed')}</StyledText>

        <StyledIcon Component={CheckRoundIcon} />
      </TxStatusContent>

      <TxActions>
        <TxActionButton onClick={exit} success>
          {actionButtonLabel}
        </TxActionButton>
      </TxActions>

      {children}
    </StyledTxStatus>
  );
};
