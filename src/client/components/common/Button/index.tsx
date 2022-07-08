import { FC } from 'react';
import styled from 'styled-components';
import { layout, space, LayoutProps, SpaceProps } from 'styled-system';

import { SpinnerLoading } from '../SpinnerLoading';

export interface ButtonProps extends LayoutProps, SpaceProps {
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  color?: string;
  outline?: boolean;
  filled?: boolean;
  onClick?: (e?: any) => void;
}

const ButtonSpinnerLoading = styled(SpinnerLoading)`
  font-size: 0.8rem;
`;

const StyledButton = styled.button<{ outline?: boolean; filled?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  height: 3.2rem;
  border: 2px solid transparent;
  border-radius: ${({ theme }) => theme.globalRadius};
  background: ${(props) => props.theme.colors.secondary};
  color: ${(props) => props.theme.colors.titlesVariant};
  font-family: inherit;
  cursor: pointer;
  user-select: none;
  font-size: 1.6rem;
  transition: filter 200ms ease-in-out;

  a,
  span,
  div {
    color: inherit;
  }

  &:focus {
    outline: none;
  }
  &:hover {
    filter: contrast(90%);
  }

  ${(props) =>
    `&:disabled {
      border-color: ${props.theme.colors.txModalColors.onBackgroundVariantColor};
      background-color: ${props.theme.colors.txModalColors.backgroundVariant};
      color: ${props.theme.colors.txModalColors.onBackgroundVariantColor};
    }
  `}

  ${(props) =>
    props.outline &&
    `
    border-color: ${props.color || props.theme.colors.primary};
    background: transparent;
    color: ${props.color || props.theme.colors.primary};
  `}

  ${({ filled, theme }) =>
    filled &&
    `
    background-color: ${theme.colors.primary};
    color: ${theme.colors.surface};
    border: none;
    border-width: 0px;
    font-weight: 700;
  `}
  ${layout}
  ${space}
`;

export const Button: FC<ButtonProps> = ({
  className,
  disabled,
  color,
  outline,
  filled,
  onClick,
  children,
  isLoading,
  ...props
}) => (
  <StyledButton
    className={className}
    disabled={disabled}
    color={color}
    outline={outline}
    filled={filled}
    onClick={onClick}
    {...props}
  >
    {isLoading ? <ButtonSpinnerLoading /> : children}
  </StyledButton>
);
