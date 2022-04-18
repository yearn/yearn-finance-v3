import { FC } from 'react';
import styled, { css } from 'styled-components';

import { styledSystem, StyledSystemProps } from '../styledSystem';

import { CardHeader } from './CardHeader';
import { CardContent } from './CardContent';
import { CardElement } from './CardElement';
import { CardEmptyList } from './CardEmptyList';
import { CardRedirection } from './CardRedirection';

const bigSize = css`
  min-height: 17.6rem;
`;

const smallSize = css`
  min-height: 11.2rem;
`;

const microSize = css`
  min-height: 8rem;
`;

const defaultVariant = css`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.titles};
`;

const primaryVariant = css`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.titles};
`;

const secondaryVariant = css`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.titles};
`;

const backgroundVariant = css`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.onBackground};
`;

const surfaceVariant = css`
  background-color: ${({ theme }) => theme.colors.surfaceVariantA};
  color: ${({ theme }) => theme.colors.titles};
`;

const sizeStyle = ({ cardSize }: CardProps) => {
  switch (cardSize) {
    case 'micro':
      return microSize;
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
    case 'background':
      return backgroundVariant;
    case 'surface':
      return surfaceVariant;
    default:
      return defaultVariant;
  }
};

type CardVariant = 'primary' | 'secondary' | 'background' | 'surface';
export type CardSizeType = 'micro' | 'small' | 'big';

export interface CardProps extends StyledSystemProps {
  onClick?: () => void;
  variant?: CardVariant;
  cardSize?: CardSizeType;
}

const StyledDiv = styled.article<CardProps>`
  border-radius: ${({ theme }) => theme.globalRadius};
  padding: 1.7rem ${({ theme }) => theme.card.padding};

  ${variantStyle};
  ${sizeStyle};
  ${styledSystem};
`;

export const Card: FC<CardProps> = (props) => <StyledDiv {...props} />;

export { CardHeader, CardContent, CardElement, CardEmptyList, CardRedirection };
