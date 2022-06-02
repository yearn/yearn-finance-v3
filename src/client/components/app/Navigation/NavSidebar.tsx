import styled from 'styled-components';
import { useLocation, useHistory } from 'react-router-dom';

import { useAppTranslation, useAppSelector } from '@hooks';
import { SettingsSelectors } from '@store';
import { NavigationLink } from '@components/app';
import { Link, Icon, Logo, RedirectIcon } from '@components/common';

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
  height: 3.1rem;
  fill: ${({ theme }) => theme.colors.logo};
  cursor: pointer;
`;

const LinkList = styled.div`
  display: grid;
  gap: 2.4rem;
  margin-top: 2.4rem;
`;

const LinkRedirectIcon = styled(Icon)`
  display: inline-block;
  fill: currentColor;
  width: 1.2rem;
  margin-left: 0.4rem;
  padding-bottom: 0.2rem;
`;

const LinkIcon = styled(Icon)`
  margin-right: 1.2rem;
  fill: ${({ theme }) => theme.colors.icons.variant};
  cursor: pointer;
  width: 2.4rem;
  height: 2.4rem;
`;

const LinkText = styled.span`
  white-space: nowrap;
  color: ${(props) => props.theme.colors.texts};
`;

const RouterLink = styled(Link)<{ selected: boolean }>`
  display: flex;
  align-items: center;
  font-size: 1.6rem;
  font-weight: 400;

  &:hover span {
    color: ${(props) => props.theme.colors.textsVariant};
  }

  svg {
    fill: ${(props) => props.theme.colors.texts};
  }

  &:hover svg {
    fill: ${(props) => props.theme.colors.textsVariant};
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
      font-weight: 700;
    }
    &:hover {
      ${LinkIcon} {
        fill: ${props.theme.colors.primary};
      }
      ${LinkText} {
        color: ${props.theme.colors.primary};
      }
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
  color: ${({ theme }) => theme.colors.icons.variant};
  background-color: transparent;
  border-radius: ${({ theme }) => theme.globalRadius};
  width: ${({ theme }) => theme.sideBar.width};
  height: 100%;
  max-width: 100%;
  max-height: calc(100% - ${({ theme }) => theme.card.padding} * 2);
  top: ${({ theme }) => theme.card.padding};
  padding: 1rem 1.2rem;
  padding-top: 3.1rem;
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
          <RouterLink to={link.to} key={index} selected={currentPath === link.to} external={link.external}>
            <LinkIcon Component={link.icon} />
            <LinkText>
              {t(link.text)} {link.external && <LinkRedirectIcon Component={RedirectIcon} />}
            </LinkText>
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
