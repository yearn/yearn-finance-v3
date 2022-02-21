import styled from 'styled-components';
import { useLocation, useHistory, Link } from 'react-router-dom';

import { useAppTranslation, useAppSelector } from '@hooks';
import { SettingsSelectors } from '@store';
import { NavigationLink } from '@components/app';
import { Icon, Logo } from '@components/common';

const linkHoverFilter = 'brightness(90%)';
const linkTransition = 'filter 200ms ease-in-out';

const SidebarHeader = styled.div`
  display: grid;
  gap: 1.2rem;
`;

const SidebarContent = styled.nav`
  display: flex;
  flex-direction: column;
  padding-top: 2rem;
  flex: 1;
`;

// const SidebarFooter = styled.div``;

const StyledLogo = styled(Logo)`
  justify-content: flex-start;
  height: 2.4rem;
  fill: ${({ theme }) => theme.colors.logo};
  cursor: pointer;
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
      fill: ${props.theme.colors.primary};
    }
    ${LinkText} {
      color: ${props.theme.colors.primary};
    }
  `}
`;

// const ToggleSidebarButton = styled(LinkIcon)`
//   fill: ${({ theme }) => theme.colors.primaryVariant};
//   transition: ${linkTransition};
//   &:hover {
//     filter: ${linkHoverFilter};
//   }
//   margin-right: 0;
// `;

const StyledSidebar = styled.div<{ collapsed?: boolean }>`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.colors.primaryVariant};
  background-color: transparent;
  border-radius: ${({ theme }) => theme.globalRadius};
  width: ${({ theme }) => theme.sideBar.width};
  height: 100%;
  max-width: 100%;
  max-height: calc(100% - ${({ theme }) => theme.card.padding} * 2);
  top: ${({ theme }) => theme.card.padding};
  padding: 1rem 1.2rem;
  padding-top: ${({ theme }) => theme.card.padding};
  transition: width ${({ theme }) => theme.sideBar.animation};
  overflow: hidden;
  overflow-y: auto;
  position: fixed;
  z-index: ${({ theme }) => theme.zindex.navSidemenu};

  ${(props) =>
    props.collapsed &&
    `
    width: ${props.theme.sideBar.collapsedWidth};

    ${LinkText} {
      display: none;
    }
  `};
`;
interface NavSidebarProps {
  navLinks: NavigationLink[];
}

export const NavSidebar = ({ navLinks, ...props }: NavSidebarProps) => {
  const { t } = useAppTranslation('common');
  const location = useLocation();
  const history = useHistory();
  const collapsedSidebar = useAppSelector(SettingsSelectors.selectSidebarCollapsed);

  const currentPath = '/' + location.pathname.toLowerCase().split('/')[1];

  // const toggleSidebar = () => {
  //   if (isMobile && collapsedSidebar) {
  //     return;
  //   }

  //   dispatch(SettingsActions.toggleSidebar());
  // };

  const linkList = (
    <LinkList className="link-list">
      {navLinks.map((link, index) => {
        return (
          <RouterLink to={link.to} key={index} selected={currentPath === link.to}>
            <LinkIcon Component={link.icon} /> <LinkText>{t(link.text)}</LinkText>
          </RouterLink>
        );
      })}
    </LinkList>
  );

  return (
    <StyledSidebar collapsed={collapsedSidebar}>
      <SidebarHeader>
        <StyledLogo full={!collapsedSidebar} onClick={() => history.push('/portfolio')} />
        {/* {!isMobile && <ToggleSidebarButton Component={CollapseIcon} onClick={toggleSidebar} />} */}
      </SidebarHeader>

      <SidebarContent>{linkList}</SidebarContent>
      {/* <SidebarFooter>
      </SidebarFooter> */}
    </StyledSidebar>
  );
};
