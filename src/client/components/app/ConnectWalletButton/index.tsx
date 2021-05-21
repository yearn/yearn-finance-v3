import styled from 'styled-components';
import { useAppTranslation } from '@hooks';
import { Button, Text } from '@components/common';

interface WalletAddressProps {
  address?: string;
  onClick: () => void;
}

const StyledButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.onSurfaceH2};
`;

export const ConnectWalletButton = ({ address, onClick }: WalletAddressProps) => {
  const { t } = useAppTranslation('common');
  let buttonMessage;

  if (!address) {
    buttonMessage = t('commons.connect-button.connect');
  } else {
    buttonMessage = address.substring(0, 6) + '...' + address.substring(address.length - 4, address.length);
  }

  return (
    <StyledButton onClick={() => onClick && onClick()}>
      <Text>{buttonMessage}</Text>
    </StyledButton>
  );
};
