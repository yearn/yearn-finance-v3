import { FC } from 'react';
import styled from 'styled-components';

import { CardHeader } from './CardHeader';
import { CardContent } from './CardContent';
import { CardElement } from './CardElement';
import { styledSystem, StyledSystemProps } from '../styledSystem';

export interface CardProps extends StyledSystemProps {
  onClick?: () => void;
}

const StyledDiv = styled.div<StyledSystemProps>`
  background-color: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.contrasts.card};
  border-radius: 1.5rem;
  padding: 1.7rem 1.1rem;
  ${styledSystem};
`;

export const Card: FC<CardProps> = (props) => <StyledDiv {...props} />;

export { CardHeader, CardContent, CardElement };
