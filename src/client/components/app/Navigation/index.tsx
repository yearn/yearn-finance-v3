import { ElementType } from 'react';
import styled from 'styled-components';
import { useWindowDimensions } from '@hooks';

import { HomeIcon, WalletIcon, VaultIcon, LabsIcon, IronBankIcon, SettingsIcon } from '@components/common';
import { NavSidebar } from './NavSidebar';
import { NavTabbar } from './NavTabbar';

export interface NavigationLink {
  to: string;
  text: string;
  icon: ElementType;
  hideMobile?: boolean;
}

const StyledNavigation = styled.nav``;

const navLinks = [
  {
    to: '/home',
    text: 'navigation.home',
    icon: HomeIcon,
  },
  {
    to: '/wallet',
    text: 'navigation.wallet',
    icon: WalletIcon,
  },
  {
    to: '/vaults',
    text: 'navigation.vaults',
    icon: VaultIcon,
  },
  {
    to: '/labs',
    text: 'navigation.labs',
    icon: LabsIcon,
  },
  {
    to: '/ironbank',
    text: 'navigation.ironbank',
    icon: IronBankIcon,
  },
  {
    to: '/settings',
    text: 'navigation.settings',
    icon: SettingsIcon,
    // hideMobile: true,
  },
];

export const Navigation = () => {
  const { isMobile } = useWindowDimensions();

  // NOTE Auto collapse sidenav on mobile
  // const dispatch = useAppDispatch();
  // const collapsedSidebar = useAppSelector(SettingsSelectors.selectSidebarCollapsed);

  // useEffect(() => {
  //   if (isMobile && !collapsedSidebar) {
  //     dispatch(SettingsActions.closeSidebar());
  //   }
  // }, [isMobile]);

  return (
    <StyledNavigation>
      {!isMobile && <NavSidebar navLinks={navLinks} />}
      {isMobile && <NavTabbar navLinks={navLinks} />}
    </StyledNavigation>
  );
};
