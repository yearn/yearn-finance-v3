import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { Button, Text } from '@components/common';
import { device } from '@themes/default';

interface WalletAddressProps {
  address?: string;
  ensName?: string;
  disabled?: boolean;
  onClick: () => void;
}

const StyledButton = styled(Button)`
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.walletButton.background};
  color: ${({ theme }) => theme.colors.walletButton.color};
  min-width: 7.4rem;

  @media ${device.mobile} {
    width: auto;
  }
`;

export const ConnectWalletButton = ({ address, ensName, disabled, onClick }: WalletAddressProps) => {
  const { t } = useAppTranslation('common');
  let buttonMessage;

  if (!address) {
    buttonMessage = t('components.connect-button.connect');
  } else {
    buttonMessage = ensName ?? address.substring(0, 6) + '...' + address.substring(address.length - 4, address.length);
  }

  return (
    <StyledButton
      onClick={() => onClick && onClick()}
      disabled={disabled}
      data-testid="connect-wallet-button"
      data-connected={!!address}
    >
      <Text ellipsis>{buttonMessage}</Text>
    </StyledButton>
  );
};
