import styled from 'styled-components';
import { useAppTranslation } from '@hooks';
import { Button, Text } from '@components/common';

interface WalletAddressProps {
  address?: string;
  onClick: () => void;
}

const StyledButton = styled(Button)`
  font-size: 1.4rem;
  &.outline {
    border-color: ${(props) => props.theme.colors.shade20};
    color: ${(props) => props.theme.colors.shade20};
  }
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
    <StyledButton onClick={() => onClick && onClick()} className="outline">
      <Text>{buttonMessage}</Text>
    </StyledButton>
  );
};
