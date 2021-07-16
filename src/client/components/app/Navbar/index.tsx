import styled from 'styled-components';
import { useWindowDimensions } from '@hooks';

import { ConnectWalletButton } from '@components/app';
import { Text } from '@components/common';

interface NavbarProps {
  className?: string;
  title?: string;
  walletAddress?: string;
  onWalletClick?: () => void;
}

const StyledNavbarActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
`;

const StyledText = styled(Text)`
  font-size: 2.4rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
`;

const StyledNavbar = styled.nav`
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  height: ${(props) => props.theme.navbar.height};
  z-index: ${(props) => props.theme.zindex.navbar};
`;

export const Navbar = ({ className, title, walletAddress, onWalletClick }: NavbarProps) => {
  const connectWalletButton = (
    <ConnectWalletButton address={walletAddress} onClick={() => onWalletClick && onWalletClick()} />
  );

  return (
    <StyledNavbar className={className}>
      {title && <StyledText>{title}</StyledText>}
      <StyledNavbarActions>{connectWalletButton}</StyledNavbarActions>
    </StyledNavbar>
  );
};
