import { FC, InputHTMLAttributes } from 'react';
import styled from 'styled-components';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  color?: string;
}

const StyledInput = styled.input`
  display: flex;
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.onBackground};
  outline: none;
  border: 1px solid ${(props) => props.theme.colors.onSurfaceH1};
  border-radius: 0.8rem;
  padding: 0 1rem;
  height: 3.6rem;
  transition: border 200ms ease-in-out;

  &::placeholder {
    color: ${(props) => props.theme.colors.onSurfaceH1};
  }
  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

export const Input: FC<InputProps> = ({ className, color, ...props }) => (
  <StyledInput className={className} color={color} {...props} />
);
