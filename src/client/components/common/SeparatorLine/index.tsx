import { FC } from 'react';
import styled from 'styled-components';

export interface SeparatorLineProps {
  className?: string;
  color?: string;
}

const StyledSeparatorLine = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.shade30};
  margin-top: 2.7rem;
  margin-bottom: 0.5rem;

  &.vertical {
    width: 1px;
    height: 100%;
    margin: 0 2rem;
  }
`;

export const SeparatorLine: FC<SeparatorLineProps> = ({ className, color, ...props }) => (
  <StyledSeparatorLine className={className} color={color} {...props} />
);
