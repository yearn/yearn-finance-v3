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
  rounded?: boolean;
  success?: boolean;
  onClick?: (e?: any) => void;
}

const ButtonSpinnerLoading = styled(SpinnerLoading)`
  font-size: 0.8rem;
`;

const StyledButton = styled.button<{
  outline?: boolean;
  filled?: boolean;
  rounded?: boolean;
  isLoading?: boolean;
  success?: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  height: 3.2rem;
  border: 2px solid transparent;
  border-radius: ${({ theme, rounded }) => (rounded ? theme.globalRadius : 0)};
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

  ${({ disabled, isLoading, success, theme: { colors } }) =>
    disabled &&
    !success &&
    !isLoading &&
    colors.button?.disabled &&
    `&:disabled {
      border-width: 1px;
      border-color: ${colors.button.disabled.borderColor};
      background-color: ${colors.button.disabled.backgroundColor};
      color: ${colors.button.disabled.color};
    }
  `}

  ${(props) =>
    props.outline &&
    `
    border-color: ${props.color || props.theme.colors.primary};
    background: transparent;
    color: ${props.color || props.theme.colors.primary};
  `}

  ${({ filled, disabled, theme }) =>
    filled &&
    `
    background-color: ${theme.colors.primary};
    color: ${theme.colors.titlesVariant};
    border: ${disabled ? undefined : 'none'};
    border-width: 0px;
    font-weight: 700;
  `}

  ${(props) =>
    props.success &&
    !props.disabled &&
    `
    background-color: ${props.theme.colors.txModalColors.success};
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
  rounded = true,
  onClick,
  children,
  isLoading,
  success,
  ...props
}) => (
  <StyledButton
    className={className}
    disabled={disabled}
    color={color}
    outline={outline}
    filled={filled}
    rounded={rounded}
    onClick={onClick}
    isLoading={isLoading}
    success={success}
    {...props}
  >
    {isLoading ? <ButtonSpinnerLoading /> : children}
  </StyledButton>
);
