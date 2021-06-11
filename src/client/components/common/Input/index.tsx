import { ElementType, FC, InputHTMLAttributes } from 'react';
import styled from 'styled-components';

import { Icon } from '@components/common';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  color?: string;
  icon?: ElementType;
}

const StyledInputContainer = styled.div`
  display: flex;
  height: 2.8rem;
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.secondary};
  border-radius: 0.8rem;
  padding: 0 1rem;
  transition: border 200ms ease-in-out;
  border: 2px solid ${(props) => props.theme.colors.onSurfaceSH1};

  &:focus-within {
    border-color: ${(props) => props.theme.colors.onSurfaceH2};
  }
`;

const StyledInput = styled.input`
  background: transparent;
  color: inherit;
  outline: none;
  border-radius: inherit;
  height: 100%;
  width: 100%;
  border: none;

  &::placeholder {
    color: ${(props) => props.theme.colors.onSurfaceH2};
  }
`;

export const Input: FC<InputProps> = ({ className, color, placeholder, icon, ...props }) => (
  <StyledInputContainer className={className} color={color} {...props}>
    {icon}
    TODO add icon style/html and conditional
    <StyledInput placeholder={placeholder} />
  </StyledInputContainer>
);
