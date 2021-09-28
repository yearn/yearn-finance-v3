import { notify, UpdateNotification } from '@frameworks/blocknative';
import { getConfig } from '@config';
import { TransactionResponse, TransactionReceipt, Network } from '@types';

export const handleTransaction = async (
  tx: TransactionResponse,
  network: Network,
  renderNotification = true
): Promise<TransactionReceipt> => {
  const { NETWORK_SETTINGS } = getConfig();
  const currentNetworkSettings = NETWORK_SETTINGS[network];
  let updateNotification: UpdateNotification | undefined;
  let dismissNotification: () => void = () => undefined;
  try {
    if (renderNotification) {
      if (currentNetworkSettings.notifyEnabled) {
        notify.hash(tx.hash);
      } else {
        const { update, dismiss } = notify.notification({
          eventCode: 'txSentCustom',
          type: 'pending',
          message: 'Your transaction has been sent to the network',
        });
        updateNotification = update;
        dismissNotification = dismiss;
      }
    }
    const receipt = await tx.wait();
    if (updateNotification) {
      updateNotification({
        eventCode: 'txConfirmedCustom',
        type: 'success',
        message: 'Your transaction has succeeded',
      });
    }
    return receipt;
  } catch (error) {
    if (error.code === 'TRANSACTION_REPLACED') {
      if (error.cancelled) {
        if (updateNotification) {
          updateNotification({
            eventCode: 'txFailedCustom',
            type: 'error',
            message: 'Your transaction has been cancelled',
          });
        }
        throw new Error('Transaction Cancelled');
      } else {
        dismissNotification();
        return await handleTransaction(error.replacement, network, !currentNetworkSettings.notifyEnabled);
      }
    }

    if (updateNotification) {
      updateNotification({
        eventCode: 'txFailedCustom',
        type: 'error',
        message: 'Your transaction has failed',
      });
    }

    throw error;
  }
};
