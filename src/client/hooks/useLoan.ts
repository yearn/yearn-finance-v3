import axios from 'axios';
import { Address, Loan } from '@src/core/types';
import { useEffect, useState } from 'react';
import { getEnv } from '@src/config/env';

export const useLoan = (addr: Address) => {
  const { DEBT_DAO_SUBGRAPH_KEY } = getEnv();
  const [loan, setLoan] = useState(null);

  useEffect(() => {
    if (loan) return;
    axios
      .post(
        // TODO turn into gql utils file
        '', // subgraph endpoint
        {
          data: {
            query: '', // import query
            variables: { id: addr },
          },
        }
      )
      .then((res) => {
        console.log('Loan from subgraph', res);
        if (!res?.data) return;
        else setLoan(res.data.loan);
      })
      .catch((error) => null);
  }, []);

  return;
};
