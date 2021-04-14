import { useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { NavSideMenuContext } from '@context';
import { useAppTranslation } from '@hooks';

import { ConnectWalletButton } from '@components/app/ConnectWalletButton';
import { Sidemenu, Icon, DeleteIcon, Logo } from '@components/common';

interface NavSidemenuProps {
  walletAddress?: string;
  onWalletClick?: () => void;
  open: boolean;
}

const StyledSidemenu = styled(Sidemenu)<{ open: boolean }>`
  background-color: ${(props) => props.theme.colors.shade90};
  width: 40rem;
  max-width: 100%;
  z-index: ${(props) => props.theme.zindex.navSidemenu};
`;

const SidemenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${(props) => props.theme.navbar.height};
  padding: 0 ${(props) => props.theme.navbar.padding};
`;

const SidemenuContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${(props) => props.theme.navbar.padding};
  padding-top: 2rem;
`;

const StyledMenuButton = styled.div`
  padding: 1rem;
  margin-right: -1rem;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
  img {
    height: 1.8rem;
  }
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 2.3rem;
`;

const StyledLink = styled(Link)`
  display: flex;
  flex-direction: column;
  padding: 2.4rem 0;
  &:not(:first-child) {
    border-top: 1px solid ${(props) => props.theme.colors.shade40};
  }
`;

export const NavSidemenu = ({ walletAddress, onWalletClick, open }: NavSidemenuProps) => {
  const { t } = useAppTranslation('common');
  const { toggle, close } = useContext(NavSideMenuContext);

  return (
    <StyledSidemenu open={open}>
      <SidemenuHeader>
        <Logo full />
        <StyledMenuButton onClick={toggle}>
          <Icon src={DeleteIcon} height="24" />
        </StyledMenuButton>
      </SidemenuHeader>

      <SidemenuContent>
        <ConnectWalletButton address={walletAddress} onClick={() => onWalletClick && onWalletClick()} />

        <LinkList>
          <StyledLink to="/" onClick={close}>
            {t('navigation.home')}
          </StyledLink>
          <StyledLink to="/Save" onClick={close}>
            {t('navigation.save')}
          </StyledLink>
        </LinkList>
      </SidemenuContent>
    </StyledSidemenu>
  );
};
