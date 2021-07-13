import { FC } from 'react';
import styled from 'styled-components';

// import { Button, SpinnerLoading } from '@components/common';
import { Button, SpinnerLoading } from '@components/common';

export const TxSpinnerLoading = styled(SpinnerLoading)`
  font-size: 0.8rem;
`;

export const StyledTxActionButton = styled(Button)<{ contrast?: boolean; success?: boolean; disabled?: boolean }>`
  height: 4rem;
  flex: 1;
  font-size: 1.4rem;
  font-weight: 500;
  text-transform: uppercase;
  gap: 0.5rem;
  background-color: ${({ theme }) => theme.colors.txModalColors.primary};
  color: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};

  ${(props) =>
    props.disabled &&
    `
    background-color: ${props.theme.colors.txModalColors.onBackgroundVariant};
    color: ${props.theme.colors.txModalColors.onBackgroundVariantColor};
  `}

  ${(props) =>
    props.contrast &&
    !props.disabled &&
    `
    background-color: ${props.theme.colors.txModalColors.loading};
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
  gap: ${({ theme }) => theme.txModal.gap};
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
