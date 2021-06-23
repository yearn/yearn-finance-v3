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
import yvBoostAbi from './contracts/yvBoost.json';

export class LabServiceImpl implements LabService {
  private web3Provider: Web3Provider;
  private config: Config;

  constructor({ web3Provider, config }: { web3Provider: Web3Provider; config: Config }) {
    this.web3Provider = web3Provider;
    this.config = config;
  }

  public async getSupportedLabs(): Promise<Lab[]> {
    const { YEARN_API, CONTRACT_ADDRESSES } = this.config;
    const { YVECRV, CRV, YVBOOST } = CONTRACT_ADDRESSES;
    const provider = this.web3Provider.getInstanceOf('default');
    const vaultsPromise = get(YEARN_API);
    const pricesPromise = get(
      'https://api.coingecko.com/api/v3/simple/price?ids=curve-dao-token,vecrv-dao-yvault&vs_currencies=usd'
    );
    const [vaultsResponse, pricesResponse] = await Promise.all([vaultsPromise, pricesPromise]);

    // **************** BACKSCRATCHER ****************
    const backscratcherContract = getContract(YVECRV, backscratcherAbi, provider);
    const totalSupply = await backscratcherContract.totalSupply();
    const backscratcherData = vaultsResponse.data.find(({ address }: { address: string }) => address === YVECRV);
    if (!backscratcherData) throw new Error(`yveCRV vault not found on ${YEARN_API} response`);
    const crvPrice = pricesResponse.data['curve-dao-token']['usd'];
    const backscratcherLab: Lab = {
      address: YVECRV,
      typeId: 'LAB',
      token: CRV,
      name: backscratcherData.name,
      version: backscratcherData.version,
      symbol: backscratcherData.symbol,
      decimals: backscratcherData.decimals.toString(),
      tokenId: CRV,
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

    // **************** YVBOOST ****************
    const yvBoostContract = getContract(YVBOOST, yvBoostAbi, provider);
    const totalAssets = await yvBoostContract.totalAssets();
    const yvBoostData = vaultsResponse.data.find(({ address }: { address: string }) => address === YVBOOST);
    if (!yvBoostData) throw new Error(`yvBoost vault not found on ${YEARN_API} response`);
    const yveCrvPrice = pricesResponse.data['vecrv-dao-yvault']['usd'];
    const yvBoostLab: Lab = {
      address: YVBOOST,
      typeId: 'LAB',
      token: YVECRV,
      name: yvBoostData.name,
      version: yvBoostData.version,
      symbol: yvBoostData.symbol,
      decimals: yvBoostData.decimals.toString(),
      tokenId: YVECRV,
      underlyingTokenBalance: {
        amount: totalAssets.toString(),
        amountUsdc: toBN(normalizeAmount(totalAssets.toString(), yvBoostData.decimals))
          .times(yveCrvPrice)
          .times(10 ** USDC_DECIMALS)
          .toFixed(0),
      },
      metadata: {},
    };
    // ********************************

    return [backscratcherLab, yvBoostLab];
  }

  public async getLabsDynamicData(): Promise<LabDynamic[]> {
    throw Error('Not Implemented');
  }

  public async getUserLabsPositions(props: GetUserLabsPositionsProps): Promise<Position[]> {
    const { userAddress } = props;
    const { YEARN_API, CONTRACT_ADDRESSES } = this.config;
    const { YVECRV, CRV, THREECRV, YVBOOST } = CONTRACT_ADDRESSES;
    const THREECRV_DECIMALS = 18;
    const provider = this.web3Provider.getInstanceOf('default');
    const vaultsPromise = get(YEARN_API);
    const pricesPromise = get(
      'https://api.coingecko.com/api/v3/simple/price?ids=curve-dao-token,vecrv-dao-yvault,lp-3pool-curve&vs_currencies=usd'
    );
    const [vaultsResponse, pricesResponse] = await Promise.all([vaultsPromise, pricesPromise]);

    // **************** BACKSCRATCHER ****************
    const backscratcherContract = getContract(YVECRV, backscratcherAbi, provider);
    const indexPromise = backscratcherContract.index();
    const supplyIndexPromise = backscratcherContract.supplyIndex(userAddress);
    const balanceOfPromise = backscratcherContract.balanceOf(userAddress);
    const cachedPromise = backscratcherContract.claimable(userAddress);
    const [index, supplyIndex, balanceOf, cached] = await Promise.all([
      indexPromise,
      supplyIndexPromise,
      balanceOfPromise,
      cachedPromise,
    ]);

    const claimable = toBN(index.toString())
      .minus(supplyIndex.toString())
      .times(balanceOf.toString())
      .div(10 ** 18)
      .plus(cached.toString())
      .toFixed(0);
    const backscratcherData = vaultsResponse.data.find(({ address }: { address: string }) => address === YVECRV);
    if (!backscratcherData) throw new Error(`yveCRV vault not found on ${YEARN_API} response`);
    const crvPrice = pricesResponse.data['curve-dao-token']['usd'];
    const threeCrvPrice = pricesResponse.data['lp-3pool-curve']['usd'];

    const backscratcherDepositPosition: Position = {
      assetAddress: YVECRV,
      tokenAddress: CRV,
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

    // **************** YVBOOST ****************
    const yvBoostContract = getContract(YVBOOST, yvBoostAbi, provider);
    const yvBoostBalanceOfPromise = yvBoostContract.balanceOf(userAddress);
    const yvBoostPricePerSharePromise = yvBoostContract.pricePerShare();
    const [yvBoostBalanceOf, yvBoostPricePerShare] = await Promise.all([
      yvBoostBalanceOfPromise,
      yvBoostPricePerSharePromise,
    ]);

    const yvBoostData = vaultsResponse.data.find(({ address }: { address: string }) => address === YVBOOST);
    if (!yvBoostData) throw new Error(`yvBoost vault not found on ${YEARN_API} response`);
    const yveCrvPrice = pricesResponse.data['vecrv-dao-yvault']['usd'];
    const underlyingBalanceOf = normalizeAmount(
      toBN(yvBoostBalanceOf.toString()).times(yvBoostPricePerShare.toString()).toFixed(0),
      yvBoostData.decimals
    );

    const yvBoostDepositPosition: Position = {
      assetAddress: YVBOOST,
      tokenAddress: YVECRV,
      typeId: 'DEPOSIT',
      balance: yvBoostBalanceOf.toString(),
      underlyingTokenBalance: {
        amount: underlyingBalanceOf,
        amountUsdc: toBN(normalizeAmount(underlyingBalanceOf, yvBoostData.decimals))
          .times(yveCrvPrice)
          .times(10 ** USDC_DECIMALS)
          .toFixed(0),
      },
      assetAllowances: [],
      tokenAllowances: [],
    };

    const yvBoostPosition: Position[] = [yvBoostDepositPosition];
    // ********************************

    return [...backscratcherPosition, ...yvBoostPosition];
  }

  public async getUserLabsMetadata(props: GetUserLabsMetadataProps): Promise<LabUserMetadata[]> {
    throw Error('Not Implemented');
  }
}
