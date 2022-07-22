import { useEffect, useState } from 'react';

import { Loan } from '@src/core/types';

export const useSelectedLoan = () => {
  const [loan, setLoan] = useState<Loan | null>(null);

  return [loan, setLoan];
};
