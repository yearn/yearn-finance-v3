import { FC } from 'react';
import styled from 'styled-components';

import { Text } from '../../Text';

const StyledCardEmptyList = styled.div<{ wrap?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  line-height: 1.7rem;
  font-weight: 400;
  margin: 6.6rem 2rem;
  text-align: center;
`;

interface CardEmptyListProps {
  text?: string;
  searching?: boolean;
  onClick?: () => void;
}

export const CardEmptyList: FC<CardEmptyListProps> = ({ children, text, searching, onClick, ...props }) => {
  return (
    <StyledCardEmptyList onClick={onClick} {...props}>
      {text ?? (
        <Text>
          <Text fontWeight="bold">No assets to display</Text>
          {searching && <Text>Please search for another asset</Text>}
        </Text>
      )}
    </StyledCardEmptyList>
  );
};
