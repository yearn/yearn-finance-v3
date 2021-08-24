import { get, toWei, GWEI } from '@utils';
import { GasService, GasFees, Config } from '@types';

export class GasServiceImpl implements GasService {
  private GAS_FEES_API = 'https://api.blocknative.com/gasprices/blockprices';
  private DEFAULT_CONFIDENCE_LEVEL = 95;
  private headers = {};

  constructor({ config }: { config: Config }) {
    this.headers = {
      Authorization: config.BLOCKNATIVE_KEY,
    };
  }

  public async getGasFees(): Promise<GasFees> {
    const response = await get(this.GAS_FEES_API, { headers: this.headers });
    const { price, maxFeePerGas, maxPriorityFeePerGas } = response.data.blockPrices
      .shift()
      .estimatedPrices.find(({ confidence }: { confidence: number }) => confidence === this.DEFAULT_CONFIDENCE_LEVEL);
    return {
      gasPrice: toWei(price, GWEI),
      maxFeePerGas: toWei(maxFeePerGas, GWEI),
      maxPriorityFeePerGas: toWei(maxPriorityFeePerGas, GWEI),
    };
  }
}
