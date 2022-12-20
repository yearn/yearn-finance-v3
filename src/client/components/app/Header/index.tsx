import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { Box, Link } from '@components/common';
import { ReactComponent as LogoFilled } from '@assets/images/yearn-logo-filled.svg';
import { transitionCss } from '@utils';

const StyledButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: transparent;
  border: none;
  font-family: inherit;
  user-select: none;
  font-size: 1.2rem;
  padding: 0.1rem 1.2rem;
  transition: filter 200ms ease-in-out;
  color: ${({ theme }) => theme.colors.primary};
  ${transitionCss}

  :hover {
    color: ${({ theme }) => theme.colors.texts};
  }
`;

const StyledLink = styled(Link)<{ selected?: boolean }>`
  font-size: 1.2rem;
  padding: 0.1rem 1.2rem;
  color: ${({ theme }) => theme.colors.primary} !important;
  font-weight: ${({ selected }) => (selected ? 'bold' : 'normal')};
  ${transitionCss}

  :hover {
    color: ${({ theme }) => theme.colors.texts} !important;
  }
`;

const LogoContainer = styled(Box)`
  position: absolute;
  left: calc(50% - 1.6rem);
  height: 3.2rem;
  width: 3.2rem;
`;

const maskAddress = (address: string) =>
  address.substring(0, 6) + '...' + address.substring(address.length - 4, address.length);

interface HeaderProps {
  walletAddress?: string;
  addressEnsName?: string;
  onWalletClick?: () => void;
}

export const Header = ({ walletAddress, addressEnsName, onWalletClick }: HeaderProps) => {
  const { t } = useAppTranslation('common');

  const walletIdentity = walletAddress
    ? addressEnsName ?? maskAddress(walletAddress)
    : t('components.connect-button.connect');

  return (
    <Box
      position="relative"
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      minHeight="3.2rem"
    >
      <LogoContainer>
        <LogoFilled />
      </LogoContainer>

      <Box>
        <StyledLink external to="https://yearn.finance" target="_self">
          Home
        </StyledLink>
        <StyledLink selected to="/">
          veYFI
        </StyledLink>
        <StyledLink external to="https://docs.yearn.finance/contributing/governance/veyfi">
          Docs
        </StyledLink>
      </Box>

      <Box display="flex" flexDirection="row" justifyContent="end" alignItems="center">
        <StyledButton onClick={() => onWalletClick && onWalletClick()}>{walletIdentity}</StyledButton>
      </Box>
    </Box>
  );
};
