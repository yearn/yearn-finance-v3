import styled from 'styled-components';

import { NavSidebar } from './NavSidebar';

const StyledNavigation = styled.nav``;
const StyledNavSidebar = styled(NavSidebar)``;

interface NavigationProps {
  collapsedSidebar?: boolean;
}

export const Navigation = ({ collapsedSidebar }: NavigationProps) => {
  return (
    <StyledNavigation>
      <StyledNavSidebar collapsed={collapsedSidebar} />
    </StyledNavigation>
  );
};
