import { FC } from 'react';
import styled from 'styled-components';

import { Button, SpinnerLoading } from '@components/common';

export const TxSpinnerLoading = styled(SpinnerLoading)`
  font-size: 0.8rem;
`;

export const StyledTxActionButton = styled(Button)<{ contrast?: boolean; success?: boolean; disabled?: boolean }>`
  height: 4rem;
  flex: 1;
  font-size: 1.6rem;
  font-weight: 700;
  gap: 0.5rem;
  background-color: ${({ theme }) => theme.colors.txModalColors.primary};
  color: ${({ theme }) => theme.colors.txModalColors.onPrimary};

  ${(props) =>
    props.disabled &&
    `
    background-color: ${props.theme.colors.txModalColors.backgroundVariant};
    color: ${props.theme.colors.txModalColors.onBackgroundVariantColor};
  `}

  ${(props) =>
    props.contrast &&
    !props.disabled &&
    `
    background-color: ${props.theme.colors.txModalColors.loading};
    color: ${props.theme.colors.txModalColors.onBackgroundVariantColor};
  `}

  ${(props) =>
    props.success &&
    !props.disabled &&
    `
    background-color: ${props.theme.colors.txModalColors.success};
  `}
`;

const StyledTxActions = styled.div`
  display: flex;
  align-items: flex-end;
  margin: calc(-${({ theme }) => theme.txModal.gap} / 2);
  margin-top: auto;

  ${StyledTxActionButton} {
    margin: calc(${({ theme }) => theme.txModal.gap} / 2);
  }
`;

export interface TxActionsProps {}

export const TxActions: FC<TxActionsProps> = ({ children, ...props }) => (
  <StyledTxActions {...props}>{children}</StyledTxActions>
);

export interface TxActionButtonProps {
  isLoading?: boolean;
  contrast?: boolean;
  success?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const TxActionButton: FC<TxActionButtonProps> = ({
  isLoading,
  contrast,
  success,
  disabled,
  children,
  ...props
}) => (
  <StyledTxActionButton contrast={contrast} success={success} disabled={disabled} {...props}>
    {isLoading ? <TxSpinnerLoading /> : children}
  </StyledTxActionButton>
);
