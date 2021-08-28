import { FC } from 'react';
import styled from 'styled-components';

export interface ButtonProps {
  className?: string;
  disabled?: boolean;
  color?: string;
  onClick?: (e?: any) => void;
}

const StyledButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  height: 2.8rem;
  border: 2px solid transparent;
  border-radius: ${({ theme }) => theme.globalRadius};
  background: ${(props) => props.theme.colors.secondary};
  color: ${(props) => props.theme.colors.background};
  font-family: inherit;
  cursor: pointer;
  user-select: none;
  font-size: 1.4rem;
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
