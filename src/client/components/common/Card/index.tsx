import { FC } from 'react';
import styled from 'styled-components';

import { styledSystem, StyledSystemProps } from '../styledSystem';

export interface CardProps extends StyledSystemProps {
  onClick?: () => void;
}

const StyledDiv = styled.div<StyledSystemProps>`
  background-color: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.contrasts.card};
  border-radius: 15px;
  padding: 17px 11px;
  ${styledSystem};
`;

export const Card: FC<CardProps> = (props) => <StyledDiv {...props} />;
