import { FC } from 'react';
import styled from 'styled-components';

interface ListHeadersProps {
  className?: string;
}

const StyledListCardsWrapper = styled.div<{ className?: string }>`
  display: grid;
  grid-template-columns: 1fr;
  /* padding: var(--list-padding); */
  gap: 1.6rem;
`;

export const ListCardsWrapper: FC<ListHeadersProps> = ({ className, children, ...props }) => (
  <StyledListCardsWrapper className={className} {...props}>
    {children}
  </StyledListCardsWrapper>
);
