import { FC } from 'react';
import styled from 'styled-components';

const StyledViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.layoutPadding};
  max-width: ${({ theme }) => theme.globalMaxWidth};
`;

export const ViewContainer: FC = ({ children, ...props }) => {
  return <StyledViewContainer {...props}>{children}</StyledViewContainer>;
};
