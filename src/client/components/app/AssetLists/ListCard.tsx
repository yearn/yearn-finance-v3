import { FC } from 'react';
import styled from 'styled-components';

import { Card } from '@components/common';

const StyledCard = styled(Card)<{ className?: string }>`
  display: grid;
  grid-template-columns: var(--asset-list-columns);
  padding: var(--asset-list-padding);
  align-items: center;

  .icon-col {
    display: flex;
    align-items: center;

    img {
      width: 3.6rem;
      height: 3.6rem;
      margin-right: 1.1rem;
    }
  }
`;

interface ListCardProps {
  className?: string;
}

export const ListCard: FC<ListCardProps> = ({ className, children, ...props }) => (
  <StyledCard className={className}>{children}</StyledCard>
);
