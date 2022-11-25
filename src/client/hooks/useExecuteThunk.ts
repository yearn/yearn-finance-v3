import { useState } from 'react';
import { AsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';

import { useAppDispatchAndUnwrap } from './store';

interface Status {
  loading?: boolean;
  error?: string;
  executed?: boolean;
}

type Thunk<T1 = void, T2 = void> = AsyncThunk<T2, T1, ThunkAPI>;
type Func<T1 = void, T2 = void> = (p: T1) => Promise<T2 | undefined>;

export const useExecuteThunk = <T1, T2>(
  thunk: Thunk<T1, T2>,
  onError?: (error: any) => void
): [Func<T1, T2>, Status, T2 | undefined] => {
  const dispatchAndUnwrap = useAppDispatchAndUnwrap();
  const [result, setResult] = useState<T2>();
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [executed, setExecuted] = useState<boolean>(false);

  const status: Status = {
    loading,
    error,
    executed,
  };

  const execute = async (p: T1) => {
    setIsLoading(true);
    setError(undefined);
    try {
      const thunkResult = await dispatchAndUnwrap(thunk(p));
      setResult(thunkResult);
      setError(undefined);
      setIsLoading(false);
      setExecuted(true);
      return thunkResult;
    } catch (error: any) {
      console.error(error.message);
      setResult(undefined);
      setError(error.message ?? 'Unknown error');
      setIsLoading(false);
      setExecuted(false);
      if (onError) onError(error);
    }
  };

  return [execute, status, result];
};
