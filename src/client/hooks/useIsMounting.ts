import { useEffect, useRef } from 'react';

export const useIsMounting = () => {
  const isMounting = useRef(true);

  useEffect(() => {
    isMounting.current = false;

    return () => {
      isMounting.current = false;
    };
  }, []);

  return isMounting.current;
};
