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

const StyledTxError = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5rem;
  background-color: ${({ theme }) => theme.colors.txModalColors.error};
  color: ${({ theme }) => theme.colors.txModalColors.textContrast};
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
`;

export interface TxErrorProps {
  errorText?: string;
}

export const TxError: FC<TxErrorProps> = ({ errorText, children, ...props }) => {
  const { t } = useAppTranslation('common');

  return (
    <StyledTxError {...props}>
      <StyledIcon Component={WarningIcon} />

      <StyledText>{errorText || t('errors.unknown')}</StyledText>
    </StyledTxError>
  );
};
