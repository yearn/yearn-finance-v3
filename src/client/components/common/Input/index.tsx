import React, { ElementType, FC, InputHTMLAttributes } from 'react';
import styled from 'styled-components';

import { Icon } from '@components/common';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  color?: string;
  Icon?: ElementType;
}

const StyledInputContainer = styled.div`
  --input-placeholder: ${(props) => props.theme.colors.onSurfaceH2};

  display: flex;
  height: 2.8rem;
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.secondary};
  fill: ${(props) => props.theme.colors.secondary};
  border-radius: ${({ theme }) => theme.globalRadius};
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
  text-align: inherit;
  font-size: inherit;
  font-weight: inherit;

  &::placeholder {
    color: var(--input-placeholder);
  }
`;

const StyledIcon = styled(Icon)`
  width: 1.6rem;
  margin-right: 0.5rem;
  fill: inherit;
`;

export const Input: FC<InputProps> = ({ className, color, placeholder, Icon, ...props }) => (
  <StyledInputContainer className={className} color={color} {...props}>
    {Icon && <StyledIcon Component={Icon} />}
    <StyledInput placeholder={placeholder} />
  </StyledInputContainer>
);
