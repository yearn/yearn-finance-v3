import { useState } from 'react';

interface Status {
  loading?: boolean;
  error?: string;
  executed?: boolean;
}

type Func<T1, T2> = (p: T1) => Promise<T2 | undefined>;

export const useExecute = <T1 = void, T2 = void>(func: Func<T1, T2>): [Func<T1, T2>, Status, T2 | undefined] => {
  const [result, setResult] = useState<T2>();
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [executed, setExecuted] = useState<boolean>(false);

  const status: Status = {
    loading,
    error,
    executed,
  };

  const execute = async (p: T1) => {
    setIsLoading(true);
    try {
      const funcResult = await func(p);
      setResult(funcResult);
      setIsLoading(false);
      setExecuted(true);
      return funcResult;
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return [execute, status, result];
};
