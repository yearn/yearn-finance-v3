import { ElementType, FC, InputHTMLAttributes } from 'react';
import styled from 'styled-components';

import { Icon } from '../Icon';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  color?: string;
  Icon?: ElementType;
}

const StyledInputContainer = styled.div`
  --input-placeholder: ${({ theme }) => theme.colors.texts};

  display: flex;
  height: 2.8rem;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.texts};
  fill: currentColor;
  border-radius: ${({ theme }) => theme.globalRadius};
  padding: 0 0.8rem;
  transition: border 200ms ease-in-out;
  border: 2px solid transparent;
  font-family: inherit;
  font-size: 1.6rem;
  font-weight: 400;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.texts};
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
  font-family: inherit;
  padding: 0;

  &::placeholder {
    color: var(--input-placeholder);
  }
`;

const StyledIcon = styled(Icon)`
  width: 1.6rem;
  margin-right: 0.8rem;
  fill: inherit;
`;

export const Input: FC<InputProps> = ({ className, color, placeholder, Icon, ...props }) => (
  <StyledInputContainer className={className} color={color} {...props}>
    {Icon && <StyledIcon Component={Icon} />}
    <StyledInput placeholder={placeholder} aria-label={placeholder} />
  </StyledInputContainer>
);
