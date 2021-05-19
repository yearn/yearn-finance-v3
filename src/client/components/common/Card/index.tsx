import { FC } from 'react';
import styled, { css } from 'styled-components';

import { CardHeader } from './CardHeader';
import { CardContent } from './CardContent';
import { CardElement } from './CardElement';
import { styledSystem, StyledSystemProps } from '../styledSystem';

const defaultVariant = css`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurface};
`;

const primaryVariant = css`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onSurfaceVariantB};
`;

const surfaceVariant = css`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurface};
`;

const variantStyle = ({ variant }: CardProps) => {
  switch (variant) {
    case 'primary':
      return primaryVariant;
    case 'surface':
      return surfaceVariant;
    default:
      return defaultVariant;
  }
};

type CardVariant = 'primary' | 'surface';

export interface CardProps extends StyledSystemProps {
  onClick?: () => void;
  variant?: CardVariant;
}

const StyledDiv = styled.div<CardProps>`
  border-radius: 1.5rem;
  padding: 1.7rem 1.1rem;
  min-width: fit-content;
  ${variantStyle};
  ${styledSystem};
`;

export const Card: FC<CardProps> = (props) => <StyledDiv {...props} />;

export { CardHeader, CardContent, CardElement };
