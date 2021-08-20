import { TransactionService, ExecuteTransactionProps, TransactionResponse, GasService } from '@types';

export class TransactionServiceImpl implements TransactionService {
  private gasService: GasService;

  constructor({ gasService }: { gasService: GasService }) {
    this.gasService = gasService;
  }

  public async execute(props: ExecuteTransactionProps): Promise<TransactionResponse> {
    const { fn, args, overrides } = props;

    let gasFees = {};
    try {
      gasFees = await this.gasService.getGasFees();
    } catch (error) {
      console.error(error);
    }

    try {
      const tx = await fn(args, { ...gasFees, ...overrides });
      return tx;
    } catch (error) {
      return fn(args, { ...overrides });
    }
  }
}
