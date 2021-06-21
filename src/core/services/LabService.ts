import { get } from '@utils';
import { getContract } from '@frameworks/ethers';
import {
  LabService,
  Web3Provider,
  Position,
  GetUserLabsMetadataProps,
  GetUserLabsPositionsProps,
  Lab,
  LabDynamic,
  LabUserMetadata,
  Config,
} from '@types';
import { toBN, normalizeAmount, USDC_DECIMALS } from '@utils';
import backscratcherAbi from './contracts/backscratcher.json';

export class LabServiceImpl implements LabService {
  private web3Provider: Web3Provider;
  private config: Config;

  constructor({ web3Provider, config }: { web3Provider: Web3Provider; config: Config }) {
    this.web3Provider = web3Provider;
    this.config = config;
  }

  public async getSupportedLabs(): Promise<Lab[]> {
    const { YEARN_API, CONTRACT_ADDRESSES } = this.config;
    const { YVECRV, CRV } = CONTRACT_ADDRESSES;
    const provider = this.web3Provider.getInstanceOf('default');
    const vaultsResponse = await get(YEARN_API);
    const pricesResponse = await get(
      'https://api.coingecko.com/api/v3/simple/price?ids=curve-dao-token,vecrv-dao-yvault&vs_currencies=usd'
    );

    // **************** BACKSCRATCHER ****************
    const backscratcherContract = getContract(YVECRV, backscratcherAbi, provider);
    const totalSupply = await backscratcherContract.totalSupply();
    const backscratcherData = vaultsResponse.data.find(({ address }: { address: string }) => address === YVECRV);
    const crvPrice = pricesResponse.data['curve-dao-token']['usd'];
    const backscratcherLab: Lab = {
      address: YVECRV,
      typeId: 'LAB',
      token: CRV,
      name: backscratcherData.name,
      version: backscratcherData.version,
      symbol: backscratcherData.symbol,
      decimals: backscratcherData.decimals.toString(),
      tokenId: backscratcherData.token.address,
      // TODO: TBD. BACKSCRATCHER TVL IS NOT CONSISTENT AMONG DIFFERENT SOURCES. FETCH FROM USDC ORACLE
      underlyingTokenBalance: {
        amount: totalSupply.toString(),
        amountUsdc: toBN(normalizeAmount(totalSupply.toString(), backscratcherData.decimals))
          .times(crvPrice)
          .times(10 ** USDC_DECIMALS)
          .toFixed(0),
      },
      metadata: {},
    };
    // ********************************

    return [backscratcherLab];
  }

  public async getLabsDynamicData(): Promise<LabDynamic[]> {
    throw Error('Not Implemented');
  }

  public async getUserLabsPositions(props: GetUserLabsPositionsProps): Promise<Position[]> {
    const { userAddress } = props;
    const { YEARN_API, CONTRACT_ADDRESSES } = this.config;
    const { YVECRV, THREECRV } = CONTRACT_ADDRESSES;
    const THREECRV_DECIMALS = 18;
    const provider = this.web3Provider.getInstanceOf('default');
    const vaultsResponse = await get(YEARN_API);
    const pricesResponse = await get(
      'https://api.coingecko.com/api/v3/simple/price?ids=curve-dao-token,vecrv-dao-yvault,lp-3pool-curve&vs_currencies=usd'
    );

    // **************** BACKSCRATCHER ****************
    const backscratcherContract = getContract(YVECRV, backscratcherAbi, provider);
    const index = await backscratcherContract.index();
    const supplyIndex = await backscratcherContract.supplyIndex(userAddress);
    const balanceOf = await backscratcherContract.balanceOf(userAddress);
    const cached = await backscratcherContract.claimable(userAddress);
    const claimable = toBN(index.toString())
      .minus(supplyIndex.toString())
      .times(balanceOf.toString())
      .div(10 ** 18)
      .plus(cached.toString())
      .toFixed(0);
    const backscratcherData = vaultsResponse.data.find(({ address }: { address: string }) => address === YVECRV);
    const crvPrice = pricesResponse.data['curve-dao-token']['usd'];
    const threeCrvPrice = pricesResponse.data['lp-3pool-curve']['usd'];

    const backscratcherDepositPosition: Position = {
      assetAddress: YVECRV,
      tokenAddress: backscratcherData.token.address,
      typeId: 'DEPOSIT',
      balance: balanceOf.toString(),
      underlyingTokenBalance: {
        amount: balanceOf.toString(), // TODO: VERIFY IF 1 YVECRV = 1 CRV
        amountUsdc: toBN(normalizeAmount(balanceOf.toString(), backscratcherData.decimals))
          .times(crvPrice)
          .times(10 ** USDC_DECIMALS)
          .toFixed(0),
      },
      assetAllowances: [],
      tokenAllowances: [],
    };

    const backscratcherYieldPosition: Position = {
      assetAddress: YVECRV,
      tokenAddress: THREECRV,
      typeId: 'YIELD',
      balance: '0', // TODO: NOTE: IF NEEDED, SHOULD HAVE CLAIMABLE 3CRV BALANCE EXPRESSED IN YVECRV
      underlyingTokenBalance: {
        amount: claimable.toString(),
        amountUsdc: toBN(normalizeAmount(claimable.toString(), THREECRV_DECIMALS))
          .times(threeCrvPrice)
          .times(10 ** USDC_DECIMALS)
          .toFixed(0),
      },
      assetAllowances: [],
      tokenAllowances: [],
    };

    const backscratcherPosition: Position[] = [backscratcherDepositPosition, backscratcherYieldPosition];
    // ********************************

    return [...backscratcherPosition];
  }

  public async getUserLabsMetadata(props: GetUserLabsMetadataProps): Promise<LabUserMetadata[]> {
    throw Error('Not Implemented');
  }
}
