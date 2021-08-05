import { notify } from '@frameworks/blocknative';

import { TransactionResponse, TransactionReceipt } from '@types';

export const handleTransaction = async (tx: TransactionResponse): Promise<TransactionReceipt> => {
  try {
    notify.hash(tx.hash);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    if (error.code === 'TRANSACTION_REPLACED') {
      if (error.cancelled) {
        throw new Error('Transaction Cancelled');
      } else {
        // notify.unsubscribe(tx.hash); TODO: VERIFY IF NOTIFICATION CHANGES AUTOMATICALLY
        return await handleTransaction(error.replacement);
      }
    }

    throw error;
  }
};
