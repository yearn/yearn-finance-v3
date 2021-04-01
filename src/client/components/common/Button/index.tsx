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
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  height: 3.7rem;
  border: 2px solid transparent;
  border-radius: 2.3rem;
  background: ${(props) => props.theme.colors.primary};
  cursor: pointer;
  user-select: none;
  font-size: 1.6rem;

  &,
  a,
  span {
    color: ${(props) => props.theme.contrasts.primary};
  }

  &:focus {
    outline: none;
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
