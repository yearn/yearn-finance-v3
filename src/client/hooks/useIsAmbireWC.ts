import { useContext } from 'react';

import { AppContext } from '@context';
import { Network } from '@types';

export default function useIsAmbireWC(network: Network): boolean {
  const appC = useContext(AppContext);

  const yearnInstance = appC?.yearnSdk.getInstanceOf(network) as any;
  const writeProvider = yearnInstance?.context?.ctx?.provider?.write?.provider;

  return writeProvider?.wc?._peerMeta?.name === 'Ambire Wallet';
}
