import { useEffect, useState } from 'react';

import { CreditLine } from '@src/core/types';

import { useCreditLines } from './useCreditLines';

export const useSelectedCreditLine = () => {
  const [creditLine, setCreditLine] = useState<CreditLine | null>(null);

  useEffect(() => {
    // if(!creditLine && )
  }, [creditLine, setCreditLine]);

  return [creditLine, setCreditLine];
};
