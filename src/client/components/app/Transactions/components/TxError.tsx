import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import { ChevronTxIcon, ErrorIcon, Icon, Text, WarningIcon } from '@components/common';
import { useAppTranslation } from '@hooks';

const StyledArrowIcon = styled(Icon)<{ isExpanded: boolean }>`
  width: 1.6rem;
  fill: currentColor;
  flex-shrink: 0;
  transform: rotate(180deg);
  transition: transform 200ms ease-in-out;

  ${({ isExpanded }) =>
    isExpanded &&
    `
    transform: rotate(0);
  `}
`;
const StyledIcon = styled(Icon)`
  width: 2.4rem;
  padding: 0 0.2rem;
  fill: currentColor;
  flex-shrink: 0;
`;

const StyledTextTitle = styled(Text)`
  color: inherit;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  white-space: no-wrap;
  line-height: 2.4rem;
`;

const StyledTextDescription = styled(Text)`
  color: inherit;
  max-width: 100%;
  font-size: 1.2rem;
  user-select: text;
`;

const StyledTxError = styled.div<{ errorType?: ErrorType }>`
  display: flex;
  align-items: stretch;
  font-weight: 100;
  font-size: 1.6rem;
  border-radius: ${({ theme }) => theme.globalRadius};
  padding: 0.8rem;
  flex-direction: column;

  background-color: ${({ theme }) => theme.colors.txModalColors.error.backgroundColor};
  color: ${({ theme }) => theme.colors.txModalColors.error.color};

  ${({ errorType, theme }) =>
    errorType === 'warning' &&
    `
    background-color: ${theme.colors.txModalColors.warning.backgroundColor};
    color: ${theme.colors.txModalColors.warning.color};
  `}
`;

const StyledTxErrorTitle = styled.div`
  display: flex;
  flex: 1;
  gap: 0.8rem;
  align-items: center;

  cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
`;

const StyledTxErrorDescription = styled.div<{ isExpanded: boolean; errorType?: ErrorType }>`
  max-height: 0;
  overflow-y: scroll;
  transition: margin 200ms ease-in-out, max-height 200ms ease-in-out;

  ${({ isExpanded }) =>
    isExpanded &&
    `
    max-height: 6.4rem;
    margin: .8rem 0;
  `}

  ::-webkit-scrollbar {
    width: 0.2rem;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.txModalColors.error.color}80;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.txModalColors.error.color};
  }

  ${({ errorType, theme }) =>
    errorType === 'warning' &&
    `
      /* Track */
      ::-webkit-scrollbar-track {
        background: ${theme.colors.txModalColors.warning.color}80;
      }

      /* Handle */
      ::-webkit-scrollbar-thumb {
        background: ${theme.colors.txModalColors.warning.color};
      }
  `}
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

  const onExpandClick = () => {
    setIsExpanded((prevIsExpanded) => !prevIsExpanded);
  };

  return (
    <StyledTxError errorType={errorType} {...props}>
      <StyledTxErrorTitle onClick={errorDescription ? onExpandClick : undefined}>
        <StyledIcon Component={errorType === 'warning' ? WarningIcon : ErrorIcon} />

        <StyledTextTitle>{errorTitle || t('errors.unknown')}</StyledTextTitle>

        {errorDescription && <StyledArrowIcon Component={ChevronTxIcon} isExpanded={isExpanded} />}
      </StyledTxErrorTitle>

      {errorDescription && (
        <StyledTxErrorDescription isExpanded={isExpanded} errorType={errorType}>
          <StyledTextDescription>{errorDescription}</StyledTextDescription>
        </StyledTxErrorDescription>
      )}
    </StyledTxError>
  );
};
