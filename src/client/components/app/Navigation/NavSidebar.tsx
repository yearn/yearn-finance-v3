import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAppTranslation, useAppSelector, useAppDispatch } from '@hooks';
import { SettingsActions, SettingsSelectors } from '@store';

import {
  HomeIcon,
  Icon,
  Logo,
  VaultIcon,
  WalletIcon,
  CollapseIcon,
  SettingsIcon,
  IronBankIcon,
} from '@components/common';

const linkHoverFilter = 'brightness(90%)';
const linkTransition = 'filter 200ms ease-in-out';

const StyledSidebar = styled.div<{ collapsed?: boolean }>`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.colors.primaryVariant};
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 0.8rem;
  width: ${({ theme }) => theme.sideBar.width};
  height: 100%;
  max-width: 100%;
  padding: 1rem 1.2rem;
  position: fixed;
  max-height: calc(100% - ${({ theme }) => theme.layoutPadding} * 2);
  transition: width ${({ theme }) => theme.sideBar.animation};
  overflow: hidden;
  overflow-y: auto;

  ${(props) =>
    props.collapsed &&
    `
    width: ${props.theme.sideBar.collapsedWidth};

    .link-list span,
    .copyright-text {
      display: none;
    }
    .copyright {
      display: block;
      text-align: center;
    }
  `};
`;

const SidebarHeader = styled.div`
  display: grid;
  grid-gap: 1.2rem;
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 2rem;
  flex: 1;
`;

const SidebarFooter = styled.div``;

const StyledLogo = styled(Logo)`
  justify-content: flex-start;
  height: 2.4rem;
  fill: ${({ theme }) => theme.colors.secondaryVariantA};
`;

const LinkList = styled.div`
  display: grid;
  grid-gap: 1.2rem;
  margin-top: 2.3rem;
`;

const RouterLink = styled(Link)`
  display: flex;
  align-items: center;
  color: inherit;
  font-size: 1.8rem;

  &:hover span {
    filter: ${linkHoverFilter};
  }

  span {
    transition: ${linkTransition};
  }
`;

const LinkIcon = styled(Icon)`
  margin-right: 1.2rem;
  fill: ${({ theme }) => theme.colors.primaryVariant};
  cursor: pointer;
  width: 2.4rem;
  height: 2.4rem;
`;

const ToggleSidebarButton = styled(LinkIcon)`
  fill: ${({ theme }) => theme.colors.primaryVariant};
  transition: ${linkTransition};
  &:hover {
    filter: ${linkHoverFilter};
  }
  margin-right: 0;
`;

export const NavSidebar = () => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const collapsedSidebar = useAppSelector(SettingsSelectors.selectSidebarCollapsed);

  const toggleSidebar = () => dispatch(SettingsActions.toggleSidebar());

  const navLinks = [
    {
      to: '/home',
      text: t('navigation.home'),
      icon: HomeIcon,
    },
    // {
    //   to: '/invest',
    //   text: t('navigation.invest'),
    //   icon: HomeIcon,
    // },
    // {
    //   to: '/save',
    //   text: t('navigation.save'),
    //   icon: HomeIcon,
    // },
    // {
    //   to: '/borrow',
    //   text: t('navigation.borrow'),
    //   icon: HomeIcon,
    // },
    {
      to: '/wallet',
      text: t('navigation.wallet'),
      icon: WalletIcon,
    },
    {
      to: '/vaults',
      text: t('navigation.vaults'),
      icon: VaultIcon,
    },
    {
      to: '/ironBank',
      text: t('navigation.ironbank'),
      icon: IronBankIcon,
    },
    {
      to: '/settings',
      text: t('navigation.settings'),
      icon: SettingsIcon,
    },
  ];

  const linkList = (
    <LinkList className="link-list">
      {navLinks.map((link, index) => {
        return (
          <RouterLink to={link.to} key={index}>
            <LinkIcon Component={link.icon} /> <span>{link.text}</span>
          </RouterLink>
        );
      })}
    </LinkList>
  );

  return (
    <StyledSidebar collapsed={collapsedSidebar}>
      <SidebarHeader>
        <StyledLogo full={!collapsedSidebar} />
        <ToggleSidebarButton Component={CollapseIcon} onClick={toggleSidebar} />
      </SidebarHeader>

      <SidebarContent>{linkList}</SidebarContent>
      <SidebarFooter>
        <span className="copyright">©</span> <span className="copyright-text">Yearn 2021</span>
      </SidebarFooter>
    </StyledSidebar>
  );
};
