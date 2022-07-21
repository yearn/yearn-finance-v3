import { ElementType, useEffect } from 'react';
import styled from 'styled-components';

import { useAppDispatch, useAppSelector, useWindowDimensions } from '@hooks';
import { SettingsActions, SettingsSelectors } from '@store';
import { WalletIcon, VaultIcon, LabsIcon, SettingsIcon, SearchIcon, DiscordIcon } from '@components/common';

import { NavSidebar } from './NavSidebar';
import { NavTabbar } from './NavTabbar';

export interface NavigationLink {
  to: string;
  text: string;
  icon: ElementType;
  hideMobile?: boolean;
  external?: boolean;
  optional?: boolean;
}

const StyledNavigation = styled.div``;

const navLinks: NavigationLink[] = [
  {
    to: '/portfolio',
    text: 'navigation.portfolio',
    icon: WalletIcon,
  },
  {
    to: '/market',
    text: 'navigation.market',
    icon: VaultIcon,
  },
  {
    to: 'https://docs.debtdao.finance',
    text: 'navigation.docs',
    icon: SearchIcon,
    external: true,
    optional: true,
  },
  {
    to: 'https://discord.gg/debtdao',
    text: 'navigation.discord',
    icon: DiscordIcon,
    external: true,
    optional: true,
  },
  {
    to: '/settings',
    text: 'navigation.settings',
    icon: SettingsIcon,
    // hideMobile: true,
  },
];

interface NavigationProps {
  hideOptionalLinks?: boolean;
}

export const Navigation = ({ hideOptionalLinks }: NavigationProps) => {
  const { isMobile, isTablet, isDesktop } = useWindowDimensions();
  const displayLinks = navLinks.filter((link) => !(link.optional && hideOptionalLinks));

  // NOTE Auto collapse sidenav on mobile
  const dispatch = useAppDispatch();
  const collapsedSidebar = useAppSelector(SettingsSelectors.selectSidebarCollapsed);

  useEffect(() => {
    if ((isTablet || isMobile) && !collapsedSidebar) {
      dispatch(SettingsActions.closeSidebar());
    }
    if (isDesktop && !isTablet && collapsedSidebar) {
      dispatch(SettingsActions.openSidebar());
    }
  }, [isMobile, isTablet, isDesktop]);

  return (
    <StyledNavigation>
      {isMobile ? <NavTabbar navLinks={displayLinks} /> : <NavSidebar navLinks={displayLinks} />}
    </StyledNavigation>
  );
};
