import { useEffect, useState } from 'react';

import { AggregatedCreditLine } from '@src/core/types';

export const useSelectedCreditLine = (): [AggregatedCreditLine | undefined, Function] => {
  const [creditLine, setCreditLine] = useState<AggregatedCreditLine | undefined>();

  useEffect(() => {
    // if(!creditLine && )
  }, [creditLine, setCreditLine]);

  return [creditLine, setCreditLine];
};
