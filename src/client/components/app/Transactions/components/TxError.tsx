import { FC } from 'react';
import styled from 'styled-components';

import { Icon, Text, WarningIcon } from '@components/common';
import { useAppTranslation } from '@hooks';

const StyledIcon = styled(Icon)`
  width: 4rem;
  fill: ${({ theme }) => theme.colors.txModalColors.textContrast};
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
  justify-content: center;
  gap: 5rem;
  padding: 0 2.1rem;
  font-weight: 500;
  font-size: 1.4rem;
  border-radius: ${({ theme }) => theme.globalRadius};
  text-transform: uppercase;
  min-height: 7.8rem;
  max-height: 10rem;
  overflow: hidden;
  overflow-y: auto;
  flex: 1;

  background-color: ${({ theme }) => theme.colors.txModalColors.error};
  color: ${({ theme }) => theme.colors.txModalColors.textContrast};

  ${({ errorType, theme }) =>
    errorType === 'warning' &&
    `
    background-color: ${theme.colors.txModalColors.warning};
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
      <StyledIcon Component={WarningIcon} />

      <StyledText>{errorText || t('errors.unknown')}</StyledText>
    </StyledTxError>
  );
};
