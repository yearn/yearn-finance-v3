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
import pickleJarAbi from './contracts/pickleJar.json';
import pickleGaugeAbi from './contracts/pickleGauge.json';

export class LabServiceImpl implements LabService {
  private web3Provider: Web3Provider;
  private config: Config;

  constructor({ web3Provider, config }: { web3Provider: Web3Provider; config: Config }) {
    this.web3Provider = web3Provider;
    this.config = config;
  }

  public async getSupportedLabs(): Promise<Lab[]> {
    const { YEARN_API, CONTRACT_ADDRESSES } = this.config;
    const { YVECRV, CRV, YVBOOST, PSLPYVBOOSTETH } = CONTRACT_ADDRESSES;
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
      metadata: {
        depositLimit: '0',
        emergencyShutdown: false,
        pricePerShare: toBN('1')
          .times(10 ** backscratcherData.decimals)
          .toFixed(0),
        apy: {
          recommended: backscratcherData.apy.composite?.totalApy,
          composite: false,
          type: backscratcherData.apy.type,
          description: '',
        },
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xc5bDdf9843308380375a611c18B50Fb9341f502A/logo-128.png',
      },
    };

    // **************** YVBOOST ****************
    const yvBoostContract = getContract(YVBOOST, yvBoostAbi, provider);
    const [totalAssets, pricePerShare, depositLimit, emergencyShutdown] = await Promise.all([
      yvBoostContract.totalAssets(),
      yvBoostContract.pricePerShare(),
      yvBoostContract.depositLimit(),
      yvBoostContract.emergencyShutdown(),
    ]);
    const yvBoostData = vaultsResponse.data.find(({ address }: { address: string }) => address === YVBOOST);
    if (!yvBoostData) throw new Error(`yvBoost vault not found on ${YEARN_API} response`);
    const yveCrvPrice = pricesResponse.data['vecrv-dao-yvault']['usd'];
    const yvBoostLab: Lab = {
      address: YVBOOST,
      typeId: 'LAB',
      token: YVECRV,
      name: yvBoostData.symbol,
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
      metadata: {
        depositLimit: depositLimit.toString(),
        emergencyShutdown: emergencyShutdown,
        pricePerShare: pricePerShare.toString(),
        apy: {
          recommended: yvBoostData.apy.net_apy,
          composite: false,
          type: yvBoostData.apy.type,
          description: '',
        },
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a/logo-128.png',
      },
    };

    // **************** YVBOOST-ETH ****************
    const pSLPyvBoostEthContract = getContract(PSLPYVBOOSTETH, pickleJarAbi, provider);
    const pJarTotalSupplyPromise = pSLPyvBoostEthContract.totalSupply();
    const pJarRatioPromise = pSLPyvBoostEthContract.getRatio();
    const picklePoolsPromise = get('https://stkpowy01i.execute-api.us-west-1.amazonaws.com/prod/protocol/pools');
    const [pJarTotalSupply, pJarRatio, picklePoolsResponse] = await Promise.all([
      pJarTotalSupplyPromise,
      pJarRatioPromise,
      picklePoolsPromise,
    ]);
    const pJarPool = picklePoolsResponse.data.find(
      ({ identifier }: { identifier: string }) => identifier === 'yvboost-eth'
    );
    const liquidityLocked = pJarPool?.liquidity_locked;
    const performance = pJarPool?.apy;

    // USE YVBOOST DATA AS BASE DATA SOURCE
    const pJarData = vaultsResponse.data.find(({ address }: { address: string }) => address === YVBOOST);
    if (!pJarData) throw new Error(`yvBoost vault not found on ${YEARN_API} response`);
    const pSLPyvBoostEthLab: Lab = {
      address: PSLPYVBOOSTETH,
      typeId: 'LAB',
      token: YVBOOST,
      name: 'pSLPyvBOOST-ETH',
      version: pJarData.version,
      symbol: 'pSLPyvBOOST-ETH',
      decimals: pJarData.decimals.toString(),
      tokenId: YVBOOST,
      underlyingTokenBalance: {
        // TODO: FIX, AMOUNT IS IN SLPYVBOOSTETH, NOT YVBOOST
        amount: toBN(normalizeAmount(pJarTotalSupply.toString(), pJarData.decimals.toString()))
          .times(pJarRatio.toString())
          .toFixed(0),
        amountUsdc: toBN(liquidityLocked.toString())
          .times(10 ** USDC_DECIMALS)
          .toFixed(0),
      },
      metadata: {
        depositLimit: '0',
        emergencyShutdown: false,
        pricePerShare: pJarRatio.toString(),
        apy: {
          recommended: toBN(performance.toString()).dividedBy(100).toNumber(),
          composite: false,
          type: pJarData.apy.type,
          description: '',
        },
        // TODO: ADD ICON ON YEARN-ASSETS
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a/logo-128.png',
      },
    };
    // ********************************

    return [backscratcherLab, yvBoostLab, pSLPyvBoostEthLab];
  }

  public async getLabsDynamicData(): Promise<LabDynamic[]> {
    throw Error('Not Implemented');
  }

  public async getUserLabsPositions(props: GetUserLabsPositionsProps): Promise<Position[]> {
    const { userAddress } = props;
    const { YEARN_API, ZAPPER_API_KEY, CONTRACT_ADDRESSES } = this.config;
    const { YVECRV, CRV, THREECRV, YVBOOST, PSLPYVBOOSTETH, PSLPYVBOOSTETH_GAUGE } = CONTRACT_ADDRESSES;
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

    // **************** YVBOOST-ETH ****************
    const pSLPyvBoostEthContract = getContract(PSLPYVBOOSTETH, pickleJarAbi, provider);
    const pickleGaugeContract = getContract(PSLPYVBOOSTETH_GAUGE, pickleGaugeAbi, provider);
    const pJarBalanceOfPromise = pSLPyvBoostEthContract.balanceOf(userAddress);
    const pGaugeBalanceOfPromise = pickleGaugeContract.balanceOf(userAddress);
    const pJarPricePerTokenPromise = get(`https://api.zapper.fi/v1/vault-stats/pickle?api_key=${ZAPPER_API_KEY}`);
    const [pJarBalanceOf, pGaugeBalanceOf, pJarPricePerTokenResponse] = await Promise.all([
      pJarBalanceOfPromise,
      pGaugeBalanceOfPromise,
      pJarPricePerTokenPromise,
    ]);

    // USE YVBOOST DATA AS BASE DATA SOURCE
    const pJarData = vaultsResponse.data.find(({ address }: { address: string }) => address === YVBOOST);
    if (!pJarData) throw new Error(`yvBoost vault not found on ${YEARN_API} response`);
    const pJarPricePerToken = pJarPricePerTokenResponse.data.find(
      ({ address }: { address: string }) => address === PSLPYVBOOSTETH
    )?.pricePerToken;

    const yvBoostEthDepositPosition: Position = {
      assetAddress: PSLPYVBOOSTETH,
      tokenAddress: YVBOOST,
      typeId: 'DEPOSIT',
      balance: pJarBalanceOf.toString(),
      underlyingTokenBalance: {
        // TBD. CONVERSION RATE FOR YVBOOST:PSLPYVBOOSTETH
        amount: '0',
        amountUsdc: toBN(normalizeAmount(pJarBalanceOf.toString(), pJarData.decimals))
          .times(pJarPricePerToken)
          .times(10 ** USDC_DECIMALS)
          .toFixed(0),
      },
      assetAllowances: [],
      tokenAllowances: [],
    };

    const yvBoostEthStakePosition: Position = {
      assetAddress: PSLPYVBOOSTETH,
      tokenAddress: PSLPYVBOOSTETH_GAUGE,
      typeId: 'STAKE',
      balance: pGaugeBalanceOf.toString(),
      underlyingTokenBalance: {
        amount: pGaugeBalanceOf.toString(),
        amountUsdc: toBN(normalizeAmount(pGaugeBalanceOf.toString(), pJarData.decimals))
          .times(pJarPricePerToken)
          .times(10 ** USDC_DECIMALS)
          .toFixed(0),
      },
      assetAllowances: [],
      tokenAllowances: [],
    };

    const yvBoostEthPosition: Position[] = [yvBoostEthDepositPosition, yvBoostEthStakePosition];
    // ********************************

    return [...backscratcherPosition, ...yvBoostPosition, ...yvBoostEthPosition];
  }

  public async getUserLabsMetadata(props: GetUserLabsMetadataProps): Promise<LabUserMetadata[]> {
    throw Error('Not Implemented');
  }
}
