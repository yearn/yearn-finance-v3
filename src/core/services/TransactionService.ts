import { TransactionService, ExecuteTransactionProps, TransactionResponse, GasService, GasFees } from '@types';

export class TransactionServiceImpl implements TransactionService {
  private gasService: GasService;

  constructor({ gasService }: { gasService: GasService }) {
    this.gasService = gasService;
  }

  public async execute(props: ExecuteTransactionProps): Promise<TransactionResponse> {
    const { fn, args, overrides } = props;

    let gasFees: GasFees = {};
    try {
      gasFees = await this.gasService.getGasFees();
    } catch (error) {
      console.error(error);
    }

    try {
      const tx = await fn(args, {
        maxFeePerGas: gasFees.maxFeePerGas,
        maxPriorityFeePerGas: gasFees.maxPriorityFeePerGas,
        ...overrides,
      });
      return tx;
    } catch (error) {
      // Retry as a legacy tx, for specific error in metamask v10 + ledger transactions
      // Metamask RPC Error: Invalid transaction params: params specify an EIP-1559 transaction but the current network does not support EIP-1559
      if (error.code === -32602) {
        const tx = await fn(args, { gasPrice: gasFees.gasPrice, ...overrides });
        return tx;
      }

      throw error;
    }
  }
}
