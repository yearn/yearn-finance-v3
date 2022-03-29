import { useState, useEffect, useContext } from 'react';
import isEqual from 'lodash/isEqual';

import { AppServiceContext } from '@context';
import { NetworkSelectors, WalletSelectors } from '@store';
import { TokenAllowance } from '@types';
import { useAppSelector } from '@hooks';

import { usePrevious } from './usePrevious';

export function useAllowance(
  tokenAddress: string | undefined,
  vaultAddress?: string,
  vaultTokenAddress?: string
): [TokenAllowance | undefined, boolean, string?] {
  const services = useContext(AppServiceContext);
  const [isLoading, setIsLoading] = useState(false);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const selectedAddress = useAppSelector(WalletSelectors.selectSelectedAddress);
  const [result, setResult] = useState<TokenAllowance | undefined>(undefined);
  const [error, setError] = useState<any | undefined>(undefined);
  const prevVault = usePrevious(vaultAddress);
  const prevTokenAddress = usePrevious(tokenAddress);
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);

  useEffect(() => {
    async function callPromise() {
      if (selectedAddress && vaultAddress && vaultTokenAddress && tokenAddress && walletIsConnected) {
        try {
          const promiseResult = await services?.vaultService.getVaultAllowance({
            network: currentNetwork,
            vaultAddress,
            vaultTokenAddress,
            tokenAddress,
            accountAddress: selectedAddress,
          });
          console.log('fetched allowance', promiseResult);
          setResult(promiseResult);
          setError(undefined);
        } catch (e) {
          setError(e);
        }
      }
      setIsLoading(false);
    }

    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevVault, vaultAddress) ||
      !isEqual(prevTokenAddress, tokenAddress)
    ) {
      console.log('fetching allowance');
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      callPromise();
    }
  }, [vaultAddress, prevVault, prevTokenAddress, tokenAddress, isLoading, result, error]);

  return [result, isLoading, error];
}
