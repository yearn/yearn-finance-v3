import { FC } from 'react';
import styled from 'styled-components';

const StyledCardEmptyList = styled.div<{ wrap?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
  min-height: 8rem;
`;

interface CardEmptyListProps {
  text?: string;
  onClick?: () => void;
}

export const CardEmptyList: FC<CardEmptyListProps> = ({ children, text, ...props }) => {
  return <StyledCardEmptyList {...props}>{text ?? 'Empty list'}</StyledCardEmptyList>;
};
