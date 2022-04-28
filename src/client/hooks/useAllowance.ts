import { useState, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import { unwrapResult } from '@reduxjs/toolkit';

import { VaultsActions, LabsActions } from '@store';
import { TokenAllowance } from '@types';
import { useAppDispatch } from '@hooks';

import { usePrevious } from './usePrevious';

interface useAllowanceProps {
  tokenAddress: string | undefined;
  vaultAddress?: string;
  isLab?: boolean;
}

type AllowanceError = {
  name?: string;
  message?: string;
  stack?: string;
};

const isError = (err: unknown): err is Error => err instanceof Error;

export function useAllowance({
  tokenAddress,
  vaultAddress,
  isLab,
}: useAllowanceProps): [TokenAllowance | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TokenAllowance | undefined>(undefined);
  const [error, setError] = useState<AllowanceError>();
  const prevVault = usePrevious(vaultAddress);
  const prevTokenAddress = usePrevious(tokenAddress);
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function callPromise() {
      if (vaultAddress && tokenAddress) {
        try {
          let promiseResult;
          if (isLab) {
            promiseResult = await dispatch(
              LabsActions.getLabAllowance({
                vaultAddress,
                tokenAddress,
              })
            );
          } else {
            promiseResult = await dispatch(
              VaultsActions.getVaultAllowance({
                vaultAddress,
                tokenAddress,
              })
            );
          }
          const result = unwrapResult(promiseResult);
          setResult(result);
          setError(undefined);
        } catch (e) {
          if (isError(e) && e.message) {
            setError(e);
          } else {
            setError({ message: JSON.stringify(e) });
          }
        }
      }
      setIsLoading(false);
    }

    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevVault, vaultAddress) ||
      !isEqual(prevTokenAddress, tokenAddress)
    ) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      callPromise();
    }
  }, [vaultAddress, prevVault, prevTokenAddress, tokenAddress, isLoading, result, error]);

  return [result, isLoading, error?.message];
}
