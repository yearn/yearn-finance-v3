import { useEffect, useState } from 'react';

import { CreditLine } from '@src/core/types';

import { useCreditLines } from './useCreditLines';

export const useSelectedCreditLine = (): [CreditLine | undefined, Function] => {
  const [creditLine, setCreditLine] = useState<CreditLine | undefined>();

  useEffect(() => {
    // if(!creditLine && )
  }, [creditLine, setCreditLine]);

  return [creditLine, setCreditLine];
};
