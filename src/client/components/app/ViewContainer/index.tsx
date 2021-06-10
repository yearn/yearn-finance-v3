import { FC } from 'react';
import styled from 'styled-components';

const StyledViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.layoutPadding};
  max-width: ${({ theme }) => theme.globalMaxWidth};
  flex: 1;
`;

export const ViewContainer: FC = ({ children, ...props }) => {
  return <StyledViewContainer {...props}>{children}</StyledViewContainer>;
};
