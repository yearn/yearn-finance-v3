import styled from 'styled-components';
import { useWindowDimensions } from '@hooks';

import { ConnectWalletButton } from '@components/app';
import { Button, Text } from '@components/common';

interface NavbarProps {
  className?: string;
  title?: string;
  walletAddress?: string;
  addressEnsName?: string;
  onWalletClick?: () => void;
}

const BetaButton = styled(Button)`
  white-space: nowrap;
  cursor: default;
  border-color: ${({ theme }) => theme.colors.walletButton.background};
  color: ${({ theme }) => theme.colors.walletButton.background};
`;

const StyledNavbarActions = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 0.8rem;
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
  max-width: ${({ theme }) => theme.globalMaxWidth};
`;

export const Navbar = ({ className, title, walletAddress, addressEnsName, onWalletClick }: NavbarProps) => {
  return (
    <StyledNavbar className={className}>
      {title && <StyledText>{title}</StyledText>}

      <StyledNavbarActions>
        <BetaButton outline>V3 BETA</BetaButton>

        <ConnectWalletButton
          address={walletAddress}
          ensName={addressEnsName}
          onClick={() => onWalletClick && onWalletClick()}
        />
      </StyledNavbarActions>
    </StyledNavbar>
  );
};
