import styled from 'styled-components';

import { ConnectWalletButton } from '@components/app/ConnectWalletButton';

interface SidemenuProps {
  walletAddress?: string;
  onWalletClick?: () => void;
  open: boolean;
}

const StyledSidemenu = styled.nav<{ open: boolean }>`
  position: absolute;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.shade40};
  top: 0;
  right: 0;
  height: 100%;
  width: 40rem;
  max-width: 100%;
  transition: transform 0.3s ease-in-out;

  transform: ${({ open }) => (open ? 'translateX(0)' : 'translateX(100%)')};
`;

const SidemenuHeader = styled.div`
  display: flex;
  align-items: center;
  height: ${(props) => props.theme.navbarHeight};
`;

const LinkList = styled.nav`
  display: flex;
  flex-direction: column;
`;

export const Sidemenu = ({ walletAddress, onWalletClick, open }: SidemenuProps) => {
  return (
    <StyledSidemenu open={open}>
      <SidemenuHeader>Yearn {walletAddress} </SidemenuHeader>
      <ConnectWalletButton address={walletAddress} onClick={() => onWalletClick && onWalletClick()} />
      <LinkList>test</LinkList>
      <LinkList>test</LinkList>
      <LinkList>test</LinkList>
      <LinkList>test</LinkList>
      <LinkList>test</LinkList>
    </StyledSidemenu>
  );
};
