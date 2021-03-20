import { memoize } from 'lodash';

import { Constants } from '@types';

export const getConstants = memoize(
  (): Constants => ({
    ETHEREUM_ADDRESS: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    MAX_UINT256:
      '115792089237316195423570985008687907853269984665640564039457584007913129639935',
  })
);
