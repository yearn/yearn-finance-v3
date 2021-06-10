import { notify } from '@frameworks/blocknative';

import { TransactionResponse } from '@types';

export const handleTransaction = async (tx: TransactionResponse) => {
  notify.hash(tx.hash);
  const receipt = await tx.wait(1);
  return receipt;
};
