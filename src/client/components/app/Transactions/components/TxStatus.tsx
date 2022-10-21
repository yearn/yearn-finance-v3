import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { CheckRoundIcon, Text, Icon, ErrorIcon } from '@components/common';

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

const TxStatusContentFail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.txModalColors.error};
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
  success: number;
}

// Pass down 2 as props for failed transactions and 1 for successful transactions

export const TxStatus: FC<TxStatusProps> = ({ transactionCompletedLabel, success, exit, children, ...props }) => {
  const { t } = useAppTranslation('common');

  const actionButtonLabel = transactionCompletedLabel ?? t('components.transaction.status.exit');

  return (
    <StyledTxStatus {...props}>
      {success === 1 ? (
        <>
          <TxStatusContent>
            <StyledText>{t('components.transaction.status.transaction-completed')}</StyledText>
            <StyledIcon Component={CheckRoundIcon} />
          </TxStatusContent>
          <TxActions>
            <TxActionButton onClick={exit} success>
              {actionButtonLabel}
            </TxActionButton>
          </TxActions>
        </>
      ) : success === 2 ? (
        <>
          <TxStatusContentFail>
            <StyledText>{t('components.transaction.status.transaction-failed')}</StyledText>
            <StyledIcon Component={ErrorIcon} />
          </TxStatusContentFail>
          <TxActions>
            <TxActionButton onClick={exit} success={false}>
              {actionButtonLabel}
            </TxActionButton>
          </TxActions>
        </>
      ) : (
        ''
      )}
      {children}
    </StyledTxStatus>
  );
};
