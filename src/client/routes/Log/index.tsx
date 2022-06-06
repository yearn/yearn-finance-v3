import { WalletSelectors } from '@store';
import { useAppSelector } from '@hooks';
import { isCoinbaseApp } from '@src/utils';

export const Log = () => {
  const wallet = useAppSelector(WalletSelectors.selectWallet);
  const log = JSON.stringify(
    {
      status: 'OK',
      wallet,
      eth: window.ethereum,
      isCoinbase: isCoinbaseApp(),
    },
    null,
    2
  );
  console.info(log);

  return (
    <pre>
      <code>{log}</code>
    </pre>
  );
};
