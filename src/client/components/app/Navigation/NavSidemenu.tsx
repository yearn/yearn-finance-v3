import { useContext } from 'react';
import styled from 'styled-components';
import { NavSideMenuContext } from '@context';

import { ConnectWalletButton } from '@components/app/ConnectWalletButton';
import { Sidemenu, Icon, DeleteIcon } from '@components/common';

interface SidemenuProps {
  walletAddress?: string;
  onWalletClick?: () => void;
  open: boolean;
}

const StyledSidemenu = styled(Sidemenu)<{ open: boolean }>`
  background: red;
  background-color: ${(props) => props.theme.colors.shade40};
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
  padding-top: 1rem;
`;

const StyledMenuButton = styled.div`
  padding: 1rem;
  margin-right: -1rem;
  flex-shrink: 0;
`;

const LinkList = styled.nav`
  display: flex;
  flex-direction: column;
`;

export const NavSidemenu = ({ walletAddress, onWalletClick, open }: SidemenuProps) => {
  const { toggle } = useContext(NavSideMenuContext);

  return (
    <StyledSidemenu open={open}>
      <SidemenuHeader>
        Yearn logo
        <StyledMenuButton onClick={toggle}>
          <Icon src={DeleteIcon} height="24" />
        </StyledMenuButton>
      </SidemenuHeader>

      <SidemenuContent>
        <ConnectWalletButton address={walletAddress} onClick={() => onWalletClick && onWalletClick()} />
        <LinkList>test</LinkList>
        <LinkList>test</LinkList>
        <LinkList>test</LinkList>
        <LinkList>test</LinkList>
        <LinkList>test</LinkList>
      </SidemenuContent>
    </StyledSidemenu>
  );
};
