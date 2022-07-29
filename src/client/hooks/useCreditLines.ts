import axios from 'axios';
import { useMemo, useState } from 'react';

import { getEnv } from '@src/config/env';
import { Address, CreditLine } from '@src/core/types';

import { useSelectedCreditLine } from './useSelectedCreditLine';

export const useCreditLines = (query?: string, params?: object) => {
  const [creditLines, setCreditLines] = useState<CreditLine[]>([]);
  if (!query) return creditLines;
  const { DEBT_DAO_SUBGRAPH_KEY } = getEnv();

  // memo used conditionally. should not use in react hook.
  // memoize normally outside react (gql client?)
  // useMemo(() => {
  //   // TODO turn into gql utils file
  //   axios
  //     .post(
  //       '', // subgraph endpoint
  //       {
  //         data: {
  //           query, // import query
  //           variables: params,
  //         },
  //       }
  //     )
  //     .then((res) => {
  //       console.log('CreditLine from subgraph', res);
  //       if (!res?.data) return;
  //       else {
  //         // format creditLine data to type
  //         setCreditLines(res.data.creditLines);
  //       }
  //     })
  //     .catch((error) => null);
  // }, [query, params]);

  return;
};
