import {
  TransactionService,
  ExecuteTransactionProps,
  ValidateSuportedAssetsProsps,
  TransactionResponse,
  GasService,
  GasFees,
  YearnSdk,
} from '@types';
import { difference } from 'lodash';
import supportedAssets from '../../utils/supported-assets.json';

export class TransactionServiceImpl implements TransactionService {
  private yearnSdk: YearnSdk;
  private gasService: GasService;

  constructor({ gasService, yearnSdk }: { gasService: GasService; yearnSdk: YearnSdk }) {
    this.gasService = gasService;
    this.yearnSdk = yearnSdk;
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

  public async validateSupportedAssets(props: ValidateSuportedAssetsProsps): Promise<void> {
    const { assetsToValidate, network } = props;
    const yearn = this.yearnSdk.getInstanceOf(network);
    // const supportedAssets = await yearn.assets.getSupportedAssets(network);
    let diff: string[] = [];
    if (network === 'mainnet') {
      diff = difference(
        assetsToValidate.map((address) => address.toLowerCase()),
        supportedAssets['mainnet'].map((address) => address.toLowerCase())
      );
    } else if (network === 'fantom') {
      diff = difference(
        assetsToValidate.map((address) => address.toLowerCase()),
        supportedAssets['fantom'].map((address) => address.toLowerCase())
      );
    }
    if (diff.length) {
      // TODO dispatch an alert or notification to yearn team.
      throw new Error('INVALID ASSETS: ' + diff.join(', '));
    }
  }
}
