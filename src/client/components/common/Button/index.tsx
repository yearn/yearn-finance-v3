import { FC } from 'react';
import styled from 'styled-components';

export interface ButtonProps {
  className?: string;
  disabled?: boolean;
  color?: string;
  onClick?: () => void;
}

const StyledButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  height: 2.8rem;
  border: 2px solid transparent;
  border-radius: 0.8rem;
  background: ${(props) => props.theme.colors.primary};
  cursor: pointer;
  user-select: none;
  font-size: 1.4rem;
  transition: filter 200ms ease-in-out;

  &,
  a,
  span,
  div {
    color: ${(props) => props.theme.colors.background};
  }

  &:focus {
    outline: none;
  }
  &:hover {
    filter: brightness(110%);
  }

  &.outline {
    border-color: ${(props) => props.color || props.theme.colors.primary};
    background: transparent;
    color: ${(props) => props.color || props.theme.colors.primary};
  }
`;

export const Button: FC<ButtonProps> = ({ className, disabled, color, onClick, children, ...props }) => (
  <StyledButton className={className} disabled={disabled} color={color} onClick={onClick} {...props}>
    {children}
  </StyledButton>
);
