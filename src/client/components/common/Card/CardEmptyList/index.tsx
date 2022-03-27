import { FC } from 'react';
import styled from 'styled-components/macro';

import { useAppTranslation } from '@hooks';
import { Text } from '@components/common';

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
  const { t } = useAppTranslation('common');

  return (
    <StyledCardEmptyList onClick={onClick} {...props}>
      {text ?? (
        <Text>
          <Text fontWeight="bold">{t('components.empty-list.text')}</Text>
          {searching && <Text>{t('components.empty-list.searching-text')}</Text>}
        </Text>
      )}
    </StyledCardEmptyList>
  );
};
