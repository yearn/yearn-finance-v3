import styled from 'styled-components';

import { NavSidebar } from './NavSidebar';

const StyledNavigation = styled.nav``;
const StyledNavSidebar = styled(NavSidebar)``;

export const Navigation = () => {
  const collapsedSidebar = false;

  return (
    <StyledNavigation>
      <StyledNavSidebar collapsed={collapsedSidebar} />
    </StyledNavigation>
  );
};
