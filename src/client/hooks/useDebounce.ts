import { useEffect, useState } from 'react';

export function useDebounce(value: string, delay: number): [string, boolean] {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isPending, setPending] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) {
      setPending(true);
    } else {
      setInitialized(true);
    }
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setPending(false);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue, isPending];
}
