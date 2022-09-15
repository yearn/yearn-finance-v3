import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { Text } from '@components/common';

const StyledFlatCardEmptyList = styled.div<{ wrap?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  line-height: 1.7rem;
  font-weight: 400;
  margin: 6.6rem 2rem;
  text-align: center;
`;

interface FlatCardEmptyListProps {
  text?: string;
  searching?: boolean;
  onClick?: () => void;
}

export const FlatCardEmptyList: FC<FlatCardEmptyListProps> = ({ children, text, searching, onClick, ...props }) => {
  const { t } = useAppTranslation('common');

  return (
    <StyledFlatCardEmptyList onClick={onClick} {...props}>
      {text ?? (
        <Text>
          <Text center fontWeight="bold">
            {t('components.empty-list.text')}
          </Text>
          {searching && <Text center>{t('components.empty-list.searching-text')}</Text>}
        </Text>
      )}
    </StyledFlatCardEmptyList>
  );
};
