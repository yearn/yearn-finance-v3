import { FC } from 'react';
import styled from 'styled-components';

import { device } from '@src/client/themes/default';

/*
  Simple container for creating 3-column layouts
*/
const StyledLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: ${({ theme }) => theme.spacing.xl};
  justify-content: flex-start;
  overflow: scroll;

  flex: 1;

  @media ${device.tablet} {
    grid-template-columns: 1fr;
    row-gap: ${({ theme }) => theme.spacing.xl};
    justify-content: center;
  }
`;

export const ThreeColumnLayout: FC = ({ children, ...props }) => {
  return <StyledLayout {...props}> {children} </StyledLayout>;
};
