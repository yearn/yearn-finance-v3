import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export const useQueryParams = <T extends object>(): T => {
  const { search } = useLocation();

  return useMemo(() => {
    const searchParams = new URLSearchParams(search);
    return Object.fromEntries(searchParams) as T;
  }, [search]);
};
