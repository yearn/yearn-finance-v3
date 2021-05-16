import { FC } from 'react';
import styled, { css } from 'styled-components';

import { CardHeader } from './CardHeader';
import { CardContent } from './CardContent';
import { CardElement } from './CardElement';
import { styledSystem, StyledSystemProps } from '../styledSystem';

const defaultVariant = css`
  background-color: ${({ theme }) => theme.oldColors.card};
  color: ${({ theme }) => theme.contrasts.card};
`;

const primaryVariant = css`
  background-color: ${({ theme }) => theme.oldColors.primary};
  color: ${({ theme }) => theme.contrasts.primary};
`;

const variantStyle = ({ variant }: CardProps) => {
  switch (variant) {
    case 'primary':
      return primaryVariant;
    default:
      return defaultVariant;
  }
};

type CardVariant = 'primary';

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
