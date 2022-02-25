import { notify, UpdateNotification } from '@frameworks/blocknative';
import { getConfig } from '@config';
import {
  TransactionService,
  ExecuteTransactionProps,
  HandleTransactionProps,
  TransactionResponse,
  GasService,
  GasFees,
  YearnSdk,
  TransactionReceipt,
  Web3Provider,
} from '@types';
import { getProviderType } from '@utils';
import { getContract } from '@frameworks/ethers';

export class TransactionServiceImpl implements TransactionService {
  private yearnSdk: YearnSdk;
  private gasService: GasService;
  private web3Provider: Web3Provider;

  constructor({
    gasService,
    yearnSdk,
    web3Provider,
  }: {
    gasService: GasService;
    yearnSdk: YearnSdk;
    web3Provider: Web3Provider;
  }) {
    this.gasService = gasService;
    this.yearnSdk = yearnSdk;
    this.web3Provider = web3Provider;
  }

  public async execute(props: ExecuteTransactionProps): Promise<TransactionResponse> {
    const { network, methodName, abi, contractAddress, args, overrides } = props;

    let gasFees: GasFees = {};
    try {
      if (network === 'mainnet') {
        // TODO: Analyze if gas service required
        // gasFees = await this.gasService.getGasFees();
      }
    } catch (error) {
      console.error(error);
    }

    try {
      const txOverrides = {
        maxFeePerGas: gasFees.maxFeePerGas,
        maxPriorityFeePerGas: gasFees.maxPriorityFeePerGas,
        ...overrides,
      };
      const txArgs = args ? [...args, txOverrides] : [txOverrides];

      const signer = this.web3Provider.getSigner();
      const contract = getContract(contractAddress, abi, signer);

      const unsignedTx = await contract.populateTransaction[methodName](...txArgs);

      // const contractIface = new Interface(abi);
      // const decodedData = contractIface.decodeFunctionData(methodName, unsignedTx.data!.toString());
      // console.log({ decodedData });

      // TODO call contract verification here.

      const tx = await signer.sendTransaction(unsignedTx);
      return tx;
    } catch (error: any) {
      // Retry as a legacy tx, for specific error in metamask v10 + ledger transactions
      // Metamask RPC Error: Invalid transaction params: params specify an EIP-1559 transaction but the current network does not support EIP-1559
      if (error.code === -32602) {
        const txOverrides = {
          gasPrice: gasFees.gasPrice,
          ...overrides,
        };
        const txArgs = args ? [...args, txOverrides] : [txOverrides];
        const signer = this.web3Provider.getSigner();
        const contract = getContract(contractAddress, abi, signer);

        const unsignedTx = await contract.populateTransaction[methodName](...txArgs);
        const tx = await signer.sendTransaction(unsignedTx);
        return tx;
      }

      throw error;
    }
  }

  public handleTransaction = async ({
    network,
    tx,
    renderNotification = true,
  }: HandleTransactionProps): Promise<TransactionReceipt> => {
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

      const providerType = getProviderType(network);
      const provider = this.web3Provider.getInstanceOf(providerType);
      const { txConfirmations } = currentNetworkSettings;

      const [receipt] = await Promise.all([
        tx.wait(txConfirmations),
        provider.waitForTransaction(tx.hash, txConfirmations),
      ]);

      if (updateNotification) {
        updateNotification({
          eventCode: 'txConfirmedCustom',
          type: 'success',
          message: 'Your transaction has succeeded',
        });
      }
      return receipt;
    } catch (error: any) {
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
          return await this.handleTransaction({
            tx: error.replacement,
            network,
            renderNotification: !currentNetworkSettings.notifyEnabled,
          });
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
}
