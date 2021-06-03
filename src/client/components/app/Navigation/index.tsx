import styled from 'styled-components';

import { NavSidebar } from './NavSidebar';

const StyledNavigation = styled.nav``;
const StyledNavSidebar = styled(NavSidebar)``;

export const Navigation = () => {
  // const { isMobile } = useWindowDimensions();

  return (
    <StyledNavigation>
      <StyledNavSidebar />
    </StyledNavigation>
  );
};
