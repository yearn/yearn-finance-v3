import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import { ChevronDownIcon, ChevronUpIcon, Icon, Text, WarningIcon } from '@components/common';
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

const StyledTextTitle = styled(Text)`
  color: inherit;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
`;

const StyledTextDescription = styled(Text)`
  color: inherit;
  max-width: 100%;
  font-size: 1.2rem;
`;

const StyledTxError = styled.div<{ errorType?: ErrorType }>`
  display: flex;
  align-items: stretch;
  font-weight: 100;
  font-size: 1.4rem;
  border-radius: ${({ theme }) => theme.globalRadius};
  padding: 0.5rem 0.7rem;
  flex-direction: column;

  background-color: ${({ theme }) => theme.colors.txModalColors.error.background};
  color: ${({ theme }) => theme.colors.txModalColors.error.color};

  ${({ errorType, theme }) =>
    errorType === 'warning' &&
    `
    background-color: ${theme.colors.txModalColors.warning.background};
    color: ${theme.colors.txModalColors.warning.color};
  `}
`;

const StyledTxErrorTitle = styled.div`
  display: flex;
  flex: 1;
  text-transform: capitalize;
  gap: 0.7rem;
  align-items: center;
`;

const StyledTxErrorDescription = styled.div<{ isExpanded: boolean }>`
  max-height: ${({ isExpanded }) => (isExpanded ? '7rem' : '0')};
  overflow-y: scroll;
  margin-top: ${({ isExpanded }) => (isExpanded ? '1rem' : '0')};
  transition: margin-top 0.5s ease-in-out, max-height 0.5s ease-in-out;
  ::-webkit-scrollbar {
    width: 0.2rem;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.txModalColors.warning.color}80;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.txModalColors.warning.color};
  }
`;

type ErrorType = 'error' | 'warning';
export interface TxErrorProps {
  errorDescription?: string;
  errorTitle?: string;
  errorType?: ErrorType;
}

export const TxError: FC<TxErrorProps> = ({ errorTitle, errorDescription, errorType, children, ...props }) => {
  const { t } = useAppTranslation('common');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    //clean state once error message changes
    setIsExpanded(false);
  }, [errorTitle, errorDescription]);

  return (
    <StyledTxError errorType={errorType} {...props}>
      <StyledTxErrorTitle>
        <StyledIcon Component={WarningIcon} errorType={errorType} />

        <StyledTextTitle>{errorTitle || t('errors.unknown')}</StyledTextTitle>

        {errorDescription && (
          <StyledIcon
            onClick={() => setIsExpanded(!isExpanded)}
            Component={isExpanded ? ChevronUpIcon : ChevronDownIcon}
            errorType={errorType}
          />
        )}
      </StyledTxErrorTitle>
      {errorDescription && (
        <StyledTxErrorDescription isExpanded={isExpanded}>
          <StyledTextDescription>{errorDescription}</StyledTextDescription>
        </StyledTxErrorDescription>
      )}
    </StyledTxError>
  );
};
