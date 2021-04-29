import { FC } from 'react';
import styled from 'styled-components';

interface ListHeadersProps {
  className?: string;
}

const StyledListHeaders = styled.div<{ className?: string }>`
  display: grid;
  grid-template-columns: var(--list-columns);
  padding: var(--list-padding);
`;

export const ListHeaders: FC<ListHeadersProps> = ({ className, children, ...props }) => (
  <StyledListHeaders className={className} {...props}>
    {children}
  </StyledListHeaders>
);
