import { FC } from 'react';
import styled, { css } from 'styled-components';

import { CardHeader } from './CardHeader';
import { CardContent } from './CardContent';
import { CardElement } from './CardElement';
import { styledSystem, StyledSystemProps } from '../styledSystem';

const bigSize = css`
  min-height: 17.2rem;
`;

const smallSize = css`
  min-height: 13.2rem;
`;

const defaultVariant = css`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurfaceH2};
`;

const primaryVariant = css`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurfaceH2};
`;

const secondaryVariant = css`
  background-color: ${({ theme }) => theme.colors.secondaryVariantA};
  color: ${({ theme }) => theme.colors.onSurfaceH1};
`;

const sizeStyle = ({ cardSize }: CardProps) => {
  switch (cardSize) {
    case 'small':
      return smallSize;
    case 'big':
      return bigSize;
    default:
      return;
  }
};

const variantStyle = ({ variant }: CardProps) => {
  switch (variant) {
    case 'primary':
      return primaryVariant;
    case 'secondary':
      return secondaryVariant;
    default:
      return defaultVariant;
  }
};

type CardVariant = 'primary' | 'secondary';
type CardSize = 'small' | 'big';

export interface CardProps extends StyledSystemProps {
  onClick?: () => void;
  variant?: CardVariant;
  cardSize?: CardSize;
}

const StyledDiv = styled.div<CardProps>`
  border-radius: 0.8rem;
  padding: 1.7rem 1.1rem;
  ${variantStyle};
  ${sizeStyle};
  ${styledSystem};
`;

export const Card: FC<CardProps> = (props) => <StyledDiv {...props} />;

export { CardHeader, CardContent, CardElement };
