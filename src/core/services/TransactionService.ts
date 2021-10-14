import { TransactionService, ExecuteTransactionProps, TransactionResponse, GasService, GasFees } from '@types';

export class TransactionServiceImpl implements TransactionService {
  private gasService: GasService;

  constructor({ gasService }: { gasService: GasService }) {
    this.gasService = gasService;
  }

  public async execute(props: ExecuteTransactionProps): Promise<TransactionResponse> {
    const { network, fn, args, overrides } = props;

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
      const tx = await fn(...txArgs);
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
        const tx = await fn(...txArgs);
        return tx;
      }

      throw error;
    }
  }
}
