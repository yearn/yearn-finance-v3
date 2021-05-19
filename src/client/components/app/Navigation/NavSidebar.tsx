import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAppTranslation } from '@hooks';

import { HomeIcon, Icon, Logo, VaultIcon, WalletIcon } from '@components/common';

interface NavSidebarProps {
  collapsed?: boolean;
}

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
  /* position: sticky; */
  max-height: calc(100% - ${({ theme }) => theme.layoutPadding} * 2);
  /* max-height: calc(100vh - ${({ theme }) => theme.layoutPadding} * 2); */

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
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 2rem;
  flex: 1;
`;

const SidebarFooter = styled.div``;

const StyledLogo = styled(Logo)`
  height: 2.4rem;
  fill: ${({ theme }) => theme.colors.background};
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
    filter: brightness(75%);
  }

  span {
    transition: filter 200ms ease-in-out;
  }
`;

const LinkIcon = styled(Icon)`
  margin-right: 1.2rem;
`;

export const NavSidebar = ({ collapsed }: NavSidebarProps) => {
  const { t } = useAppTranslation('common');

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
      to: '/settings',
      text: t('navigation.settings'),
      icon: HomeIcon,
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
    <StyledSidebar collapsed={collapsed}>
      <SidebarHeader>
        <StyledLogo full={!collapsed} />
      </SidebarHeader>

      <SidebarContent>{linkList}</SidebarContent>
      <SidebarFooter>
        <span className="copyright">©</span> <span className="copyright-text">Yearn 2021</span>
      </SidebarFooter>
    </StyledSidebar>
  );
};
