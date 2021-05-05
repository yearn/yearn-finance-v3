import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAppTranslation } from '@hooks';

import { HomeIcon, Icon, Logo } from '@components/common';

const StyledSidebar = styled.div`
  display: flex;
  flex-direction: column;
  border: 2px solid ${({ theme }) => theme.colors.shade0};
  border-radius: 0.8rem;
  width: 16rem;
  height: 100%;
  max-width: 100%;
  padding: 1rem 1.2rem;
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

export const NavSidebar = () => {
  const { t } = useAppTranslation('common');

  const navLinks = [
    {
      to: '/',
      text: t('navigation.home'),
      icon: HomeIcon,
    },
    {
      to: '/dashboard',
      text: t('navigation.dashboard'),
      icon: HomeIcon,
    },
    {
      to: '/invest',
      text: t('navigation.invest'),
      icon: HomeIcon,
    },
    {
      to: '/save',
      text: t('navigation.save'),
      icon: HomeIcon,
    },
    {
      to: '/borrow',
      text: t('navigation.borrow'),
      icon: HomeIcon,
    },
  ];

  const linkList = (
    <LinkList>
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
    <StyledSidebar>
      <SidebarHeader>
        <StyledLogo full />
      </SidebarHeader>

      <SidebarContent>{linkList}</SidebarContent>
      <SidebarFooter>© Yearn 2021</SidebarFooter>
    </StyledSidebar>
  );
};
