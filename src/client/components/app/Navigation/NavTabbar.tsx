import styled from 'styled-components';
import { useLocation, Link } from 'react-router-dom';

import { useAppTranslation } from '@hooks';
import { NavigationLink } from '@components/app';
import { Icon } from '@components/common';

const linkHoverFilter = 'brightness(90%)';
const linkTransition = 'filter 200ms ease-in-out';

const LinkList = styled.div`
  display: flex;
  flex: 1;
  color: inherit;
`;

const LinkIcon = styled(Icon)`
  fill: currentColor;
  cursor: pointer;
  width: 2.4rem;
  height: 2.4rem;
  color: inherit;
`;

const LinkText = styled.span`
  white-space: nowrap;
  margin-top: 0.4rem;
  color: inherit;
`;

const RouterLink = styled(Link)<{ selected: boolean }>`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  color: inherit;
  font-size: 1.2rem;
  flex: 1;
  padding: 0.5rem;

  &:hover span {
    filter: ${linkHoverFilter};
  }

  span {
    transition: ${linkTransition};
  }
  ${(props) =>
    props.selected &&
    `
    color: ${props.theme.colors.titlesVariant};
  `}
`;

const StyledTabbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  background-color: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.titlesVariant};
  color: ${({ theme }) => theme.colors.texts};
  border-radius: ${({ theme }) => theme.globalRadius};
  width: 100%;
  height: ${({ theme }) => theme.tabbar.height};
  max-width: calc(100% - ${({ theme }) => theme.layoutPadding} * 2);
  bottom: ${({ theme }) => theme.layoutPadding};
  position: fixed;
  overflow: hidden;
  z-index: ${({ theme }) => theme.zindex.navSidemenu};
`;
interface NavTabbarProps {
  navLinks: NavigationLink[];
}

export const NavTabbar = ({ navLinks, ...props }: NavTabbarProps) => {
  const { t } = useAppTranslation('common');
  const location = useLocation();

  const currentPath = '/' + location.pathname.toLowerCase().split('/')[1];

  return (
    <StyledTabbar {...props}>
      <LinkList>
        {navLinks.map(
          (link: NavigationLink, index) =>
            !link.hideMobile && (
              <RouterLink to={link.to} key={index} selected={currentPath === link.to}>
                <LinkIcon Component={link.icon} />
                <LinkText>{t(link.text)}</LinkText>
              </RouterLink>
            )
        )}
      </LinkList>
    </StyledTabbar>
  );
};
