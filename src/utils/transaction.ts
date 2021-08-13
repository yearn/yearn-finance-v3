import { notify } from '@frameworks/blocknative';

import { TransactionResponse, TransactionReceipt } from '@types';

export const handleTransaction = async (
  tx: TransactionResponse,
  renderNotification = true
): Promise<TransactionReceipt> => {
  try {
    if (renderNotification) {
      notify.hash(tx.hash);
    }
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    if (error.code === 'TRANSACTION_REPLACED') {
      if (error.cancelled) {
        throw new Error('Transaction Cancelled');
      } else {
        return await handleTransaction(error.replacement, false);
      }
    }

    throw error;
  }
};
