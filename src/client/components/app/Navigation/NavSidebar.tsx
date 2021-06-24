import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';

import { useAppTranslation, useAppSelector, useAppDispatch } from '@hooks';
import { SettingsActions, SettingsSelectors } from '@store';

import {
  Icon,
  Logo,
  CollapseIcon,
  HomeIcon,
  WalletIcon,
  VaultIcon,
  LabsIcon,
  IronBankIcon,
  SettingsIcon,
} from '@components/common';

const linkHoverFilter = 'brightness(90%)';
const linkTransition = 'filter 200ms ease-in-out';

const SidebarHeader = styled.div`
  display: grid;
  gap: 1.2rem;
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
  gap: 1.2rem;
  margin-top: 2.3rem;
`;

const LinkIcon = styled(Icon)`
  margin-right: 1.2rem;
  fill: ${({ theme }) => theme.colors.primaryVariant};
  cursor: pointer;
  width: 2.4rem;
  height: 2.4rem;
`;

const LinkText = styled.span`
  white-space: nowrap;
`;

const RouterLink = styled(Link)<{ selected: boolean }>`
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
  ${(props) =>
    props.selected &&
    `
    ${LinkIcon} {
      fill: ${props.theme.colors.secondary};
    }
    ${LinkText} {
      color: ${props.theme.colors.secondary};
    }
  `}
`;

const CopyrightSmall = styled.span`
  display: none;
`;
const CopyrightLarge = styled.span`
  white-space: nowrap;
`;

const ToggleSidebarButton = styled(LinkIcon)`
  fill: ${({ theme }) => theme.colors.primaryVariant};
  transition: ${linkTransition};
  &:hover {
    filter: ${linkHoverFilter};
  }
  margin-right: 0;
`;

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

    ${LinkText},
    ${CopyrightLarge} {
      display: none;
    }
    ${CopyrightSmall} {
      display: block;
      text-align: center;
    }
  `};
`;

export const NavSidebar = () => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const location = useLocation();
  const collapsedSidebar = useAppSelector(SettingsSelectors.selectSidebarCollapsed);

  const currentPath = '/' + location.pathname.toLowerCase().split('/')[1];

  const toggleSidebar = () => dispatch(SettingsActions.toggleSidebar());

  const navLinks = [
    {
      to: '/home',
      text: t('navigation.home'),
      icon: HomeIcon,
    },
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
      to: '/labs',
      text: t('navigation.labs'),
      icon: LabsIcon,
    },
    {
      to: '/ironbank',
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
          <RouterLink to={link.to} key={index} selected={currentPath === link.to}>
            <LinkIcon Component={link.icon} /> <LinkText>{link.text}</LinkText>
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
        <CopyrightSmall>{t('navigation.copyright.small')}</CopyrightSmall>
        <CopyrightLarge>{t('navigation.copyright.big')}</CopyrightLarge>
      </SidebarFooter>
    </StyledSidebar>
  );
};
