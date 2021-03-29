import { useAppTranslation } from '@hooks';
import { Text } from '@components/common';

interface WalletAddressProps {
  address?: string;
  onClick: () => void;
}

export const ConnectWalletButton = ({ address, onClick }: WalletAddressProps) => {
  const { t } = useAppTranslation('common');

  if (!address) {
    return <button onClick={onClick}>{t('button.connect')}</button>;
  }

  const maskedAddress = address.substring(0, 6) + '...' + address.substring(address.length - 4, address.length);

  return (
    <button onClick={onClick}>
      <Text textColor="primary">{maskedAddress}</Text>
    </button>
  );
};
