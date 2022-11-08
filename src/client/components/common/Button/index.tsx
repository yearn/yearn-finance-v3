import { FC } from 'react';
import styled from 'styled-components';

export interface ButtonProps {
  className?: string;
  disabled?: boolean;
  color?: string; // TODO deprecate
  styling?: string;
  outline?: boolean;
  onClick?: (e?: any) => void;
}

const StyledButton = styled.button<{ styling?: string; outline?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  height: 3.2rem;
  border: 2px solid transparent;
  border-radius: ${({ theme }) => theme.globalRadius};

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

  ${({ theme, styling }) =>
    styling === 'primary'
      ? `background-color: ${theme.colors.txModalColors.primary};
      color: ${theme.colors.titlesVariant};`
      : styling === 'secondary'
      ? `background-color: ${theme.colors.txModalColors.backgroundVariant};
      color: ${theme.colors.titlesVariant};`
      : `background-color: ${theme.colors.txModalColors.primary};
          color: ${theme.colors.titlesVariant};`}
`;

export const Button: FC<ButtonProps> = ({
  className,
  disabled,
  styling,
  color,
  outline,
  onClick,
  children,
  ...props
}) => (
  <StyledButton
    className={className}
    styling={styling}
    disabled={disabled}
    color={color}
    outline={outline}
    onClick={onClick}
    {...props}
  >
    {children}
  </StyledButton>
);
