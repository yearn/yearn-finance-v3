import { FC } from 'react';
import styled from 'styled-components';

const StyledViewContainer = styled.main<{ noGap?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ noGap, theme }) => (noGap ? '0' : theme.layoutPadding)};
  max-width: ${({ theme }) => theme.globalMaxWidth};
  flex: 1;
  overflow: hidden;
  overflow-y: auto;
`;

interface ViewContainerProps {
  noGap?: boolean;
}

export const ViewContainer: FC<ViewContainerProps> = ({ children, ...props }) => {
  return <StyledViewContainer {...props}>{children}</StyledViewContainer>;
};
