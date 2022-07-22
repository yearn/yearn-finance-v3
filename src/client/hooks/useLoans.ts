import axios from 'axios';
import { useMemo, useState } from 'react';

import { getEnv } from '@src/config/env';
import { Address, Loan } from '@src/core/types';

import { useSelectedLoan } from './useSelectedLoan';

export const useLoans = (query: string, params: object) => {
  const { DEBT_DAO_SUBGRAPH_KEY } = getEnv();
  const [loans, setLoans] = useState<Loan[]>([]);

  useMemo(() => {
    // TODO turn into gql utils file
    axios
      .post(
        '', // subgraph endpoint
        {
          data: {
            query, // import query
            variables: params,
          },
        }
      )
      .then((res) => {
        console.log('Loan from subgraph', res);
        if (!res?.data) return;
        else {
          // format loan data to type
          setLoans(res.data.loans);
        }
      })
      .catch((error) => null);
  }, [query, params]);

  return;
};
