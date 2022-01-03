import { Web3Provider } from '@ethersproject/providers';
import { Interface } from '@ethersproject/abi';
import {
  TransactionService,
  ExecuteTransactionProps,
  TransactionResponse,
  GasService,
  GasFees,
  YearnSdk,
} from '@types';
import { getContract } from '../frameworks/ethers';

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
}
