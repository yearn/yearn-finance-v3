import { FC } from 'react';
import styled, { css } from 'styled-components';

import { styledSystem, StyledSystemProps } from '../styledSystem';

import { FlatCardHeader } from './FlatCardHeader';
import { FlatCardContent } from './FlatCardContent';
import { FlatCardElement } from './FlatCardElement';
import { FlatCardEmptyList } from './FlatCardEmptyList';
import { FlatCardRedirection } from './FlatCardRedirection';

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

const sizeStyle = ({ cardSize }: FlatCardProps) => {
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

const variantStyle = ({ variant }: FlatCardProps) => {
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

type FlatCardVariant = 'primary' | 'secondary' | 'background' | 'surface';
export type FlatCardSizeType = 'micro' | 'small' | 'big';

export interface FlatCardProps extends StyledSystemProps {
  onClick?: () => void;
  variant?: FlatCardVariant;
  cardSize?: FlatCardSizeType;
}

const StyledDiv = styled.article<FlatCardProps>`
  padding: 1.7rem ${({ theme }) => theme.card.padding};

  ${variantStyle};
  ${sizeStyle};
  ${styledSystem};
`;

export const FlatCard: FC<FlatCardProps> = (props) => <StyledDiv {...props} />;

export { FlatCardHeader, FlatCardContent, FlatCardElement, FlatCardEmptyList, FlatCardRedirection };
