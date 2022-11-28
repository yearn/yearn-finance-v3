import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { Box } from '@components/common';
import { ReactComponent as LogoFilled } from '@assets/images/yearn-logo-filled.svg';

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
  transition: filter 200ms ease-in-out;
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
    <Box display="flex" flexDirection="row" justifyContent="end" alignItems="center" minHeight="3.2rem">
      <LogoContainer>
        <LogoFilled />
      </LogoContainer>

      <Box display="flex" flexDirection="row" justifyContent="end" alignItems="center">
        <StyledButton onClick={() => onWalletClick && onWalletClick()}>{walletIdentity}</StyledButton>
      </Box>
    </Box>
  );
};
