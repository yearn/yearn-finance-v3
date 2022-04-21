import { FC } from 'react';
import styled from 'styled-components';

import { Icon, Text, WarningIcon } from '@components/common';
import { useAppTranslation } from '@hooks';

const StyledIcon = styled(Icon)<{ errorType?: ErrorType }>`
  width: 2rem;
  fill: ${({ theme }) => theme.colors.txModalColors.error.color};
  ${({ errorType, theme }) =>
    errorType === 'warning' &&
    `
    fill: ${theme.colors.txModalColors.warning.color};
  `}
  flex-shrink: 0;
`;

const StyledText = styled(Text)`
  color: inherit;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledTxError = styled.div<{ errorType?: ErrorType }>`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-weight: 500;
  font-size: 1.4rem;
  border-radius: ${({ theme }) => theme.globalRadius};
  text-transform: capitalize;
  padding: 0.5rem 0.7rem;
  max-height: 10rem;
  overflow: hidden;
  overflow-y: auto;
  flex: 1;

  background-color: ${({ theme }) => theme.colors.txModalColors.error.background};
  color: ${({ theme }) => theme.colors.txModalColors.error.color};

  ${({ errorType, theme }) =>
    errorType === 'warning' &&
    `
    background-color: ${theme.colors.txModalColors.warning.background};
    color: ${theme.colors.txModalColors.warning.color};
  `}
`;

type ErrorType = 'error' | 'warning';
export interface TxErrorProps {
  errorText?: string;
  errorType?: ErrorType;
}

export const TxError: FC<TxErrorProps> = ({ errorText, errorType, children, ...props }) => {
  const { t } = useAppTranslation('common');

  return (
    <StyledTxError errorType={errorType} {...props}>
      <StyledIcon Component={WarningIcon} errorType={errorType} />

      <StyledText>{errorText || t('errors.unknown')}</StyledText>
    </StyledTxError>
  );
};
