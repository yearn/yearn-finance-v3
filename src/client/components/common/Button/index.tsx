import { FC } from 'react';
import styled from 'styled-components/macro';

export interface ButtonProps {
  className?: string;
  disabled?: boolean;
  color?: string;
  outline?: boolean;
  onClick?: (e?: any) => void;
}

const StyledButton = styled.button<{ outline?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 1.6rem;
  height: 2.8rem;
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
    props.outline &&
    `
    border-color: ${props.color || props.theme.colors.primary};
    background: transparent;
    color: ${props.color || props.theme.colors.primary};
  `}
`;

export const Button: FC<ButtonProps> = ({ className, disabled, color, outline, onClick, children, ...props }) => (
  <StyledButton className={className} disabled={disabled} color={color} outline={outline} onClick={onClick} {...props}>
    {children}
  </StyledButton>
);
