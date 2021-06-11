import { useEffect } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector, useWindowDimensions } from '@hooks';

import { NavSidebar } from './NavSidebar';
import { SettingsActions, SettingsSelectors } from '@store';

const StyledNavigation = styled.nav``;
const StyledNavSidebar = styled(NavSidebar)``;

export const Navigation = () => {
  const { isMobile } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const collapsedSidebar = useAppSelector(SettingsSelectors.selectSidebarCollapsed);

  // NOTE If this throws a propagation error between Navigation and Navsidebar, just move it to NavSidebar
  // Keep watch
  useEffect(() => {
    if (isMobile && !collapsedSidebar) {
      console.log(isMobile);
      dispatch(SettingsActions.closeSidebar());
    }
  }, [isMobile]);
  //

  return (
    <StyledNavigation>
      <StyledNavSidebar />
    </StyledNavigation>
  );
};
