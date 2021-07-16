import styled from 'styled-components';
import { useAppTranslation } from '@hooks';
import { Button, Text } from '@components/common';

interface WalletAddressProps {
  address?: string;
  ensName?: string;
  onClick: () => void;
}

const StyledButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.walletButton.background};
  color: ${({ theme }) => theme.colors.walletButton.color};
`;

export const ConnectWalletButton = ({ address, ensName, onClick }: WalletAddressProps) => {
  const { t } = useAppTranslation('common');
  let buttonMessage;

  if (!address) {
    buttonMessage = t('commons.connect-button.connect');
  } else {
    buttonMessage = ensName ?? address.substring(0, 6) + '...' + address.substring(address.length - 4, address.length);
  }

  return (
    <StyledButton onClick={() => onClick && onClick()}>
      <Text>{buttonMessage}</Text>
    </StyledButton>
  );
};
