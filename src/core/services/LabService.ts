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
  DepositProps,
  WithdrawProps,
  StakeProps,
  ClaimProps,
  TransactionResponse,
  TransactionService,
  YearnSdk,
  GetSupportedLabsProps,
} from '@types';
import { get, toBN, normalizeAmount, USDC_DECIMALS, getProviderType } from '@utils';
import { getConstants } from '@config/constants';

import backscratcherAbi from './contracts/backscratcher.json';
import y3CrvBackZapperAbi from './contracts/y3CrvBackZapper.json';
import yvBoostAbi from './contracts/yvBoost.json';

/**
 * Annual Percentage Yield composite of a particular backscratcher vault coming from api.yearn.finance.
 */
interface BackscracherApyComposite {
  currentBoost: number;
  boostedApy: number;
  totalApy: number;
  poolApy: number;
  baseApy: number;
}

export class LabServiceImpl implements LabService {
  private transactionService: TransactionService;
  private yearnSdk: YearnSdk;
  private web3Provider: Web3Provider;
  private config: Config;

  constructor({
    transactionService,
    web3Provider,
    yearnSdk,
    config,
  }: {
    transactionService: TransactionService;
    web3Provider: Web3Provider;
    yearnSdk: YearnSdk;
    config: Config;
  }) {
    this.transactionService = transactionService;
    this.web3Provider = web3Provider;
    this.yearnSdk = yearnSdk;
    this.config = config;
  }

  public async getSupportedLabs({ network }: GetSupportedLabsProps) {
    const errors: string[] = [];
    const { YEARN_API, CONTRACT_ADDRESSES } = this.config;
    const { YVECRV, CRV, YVBOOST } = CONTRACT_ADDRESSES;
    const { ASSETS_ICON_URL } = getConstants();
    const yearn = this.yearnSdk.getInstanceOf(network);
    const providerType = getProviderType(network);
    const provider = this.web3Provider.getInstanceOf(providerType);
    const vaultsPromise = get(YEARN_API);
    const pricesPromise = get(
      'https://api.coingecko.com/api/v3/simple/price?ids=curve-dao-token,vecrv-dao-yvault&vs_currencies=usd'
    );
    const [vaultsResponse, pricesResponse] = await Promise.all([vaultsPromise, pricesPromise]);

    // **************** BACKSCRATCHER ****************
    let backscratcherLab: Lab | undefined;
    try {
      const backscratcherContract = getContract(YVECRV, backscratcherAbi, provider);
      const totalSupply = await backscratcherContract.totalSupply();
      const backscratcherData = vaultsResponse.data.find(({ address }: { address: string }) => address === YVECRV);
      if (!backscratcherData) throw new Error(`yveCRV vault not found on ${YEARN_API} response`);
      const crvPrice = pricesResponse.data['curve-dao-token']['usd'];
      backscratcherLab = {
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
          depositLimit: '0', // yvecrv doestn have
          emergencyShutdown: false, // yvecrv doesnt have
          pricePerShare: toBN('1')
            .times(10 ** backscratcherData.decimals)
            .toFixed(0),
          apy: backscratcherData.apy
            ? {
                ...backscratcherData.apy,
                composite: backscratcherData.apy.composite
                  ? {
                      ...backscratcherData.apy.composite,
                      boost:
                        backscratcherData.apy.composite.boost ||
                        (backscratcherData.apy.composite as unknown as BackscracherApyComposite).currentBoost,
                      pool_apy:
                        backscratcherData.apy.composite.pool_apy ||
                        (backscratcherData.apy.composite as unknown as BackscracherApyComposite).poolApy,
                      boosted_apr:
                        backscratcherData.apy.composite.boosted_apr ||
                        (backscratcherData.apy.composite as unknown as BackscracherApyComposite).boostedApy,
                      base_apr:
                        backscratcherData.apy.composite.base_apr ||
                        (backscratcherData.apy.composite as unknown as BackscracherApyComposite).baseApy,
                    }
                  : null,
              }
            : undefined,
          displayName: backscratcherData.name,
          displayIcon: `${ASSETS_ICON_URL}${YVECRV}/logo-128.png`,
          defaultDisplayToken: CRV,
        },
      };
    } catch (error) {
      // TODO handle error
      errors.push('YveCrv Lab Error');
    }

    // **************** YVBOOST ****************
    let yvBoostLab: Lab | undefined;
    try {
      // TODO: Use yearn.vaults.getDynamic when issue solved in SDK
      const [yvBoostVaultDynamic] = await yearn.vaults.get([YVBOOST]);
      const yvBoostData = vaultsResponse.data.find(({ address }: { address: string }) => address === YVBOOST);

      // TODO We could use the data from `yvBoostVaultDynamic`
      if (!yvBoostData) {
        throw new Error(`yvBoost vault not found on ${YEARN_API} response`);
      }

      if (!yvBoostVaultDynamic) {
        throw new Error(`yvBoost vault not found on yearn dynamic vaults response`);
      }

      const { address, decimals, name, symbol, token, version } = yvBoostData;

      const { underlyingTokenBalance } = yvBoostVaultDynamic;

      yvBoostLab = {
        address,
        typeId: 'LAB',
        token: token.address,
        name,
        version,
        symbol,
        decimals: decimals.toString(),
        tokenId: token.address,
        underlyingTokenBalance,
        metadata: {
          ...yvBoostVaultDynamic.metadata,
          displayIcon: `${ASSETS_ICON_URL}${address}/logo-128.png`,
          zapInWith: 'portalsZapIn', // TODO: should not be hardcoded. Update once SDK is updated
          zapOutWith: 'portalsZapOut', // TODO: should not be hardcoded. Update once SDK is updated
        },
      };
    } catch (error) {
      errors.push(`YvBoost Lab Error ${JSON.stringify(error)}`);
    }

    // ********************************
    const labsData: Lab[] = [];
    [backscratcherLab, yvBoostLab].forEach((lab) => {
      if (lab) labsData.push(lab);
    });
    return { labsData, errors };
  }

  public async getLabsDynamicData(): Promise<LabDynamic[]> {
    throw Error('Not Implemented');
  }

  public async getUserLabsPositions(props: GetUserLabsPositionsProps) {
    const { userAddress, network } = props;
    const { YEARN_API, CONTRACT_ADDRESSES } = this.config;
    const { YVECRV, CRV, THREECRV, YVBOOST } = CONTRACT_ADDRESSES;
    const THREECRV_DECIMALS = 18;
    const providerType = getProviderType(network);
    const provider = this.web3Provider.getInstanceOf(providerType);
    const vaultsPromise = get(YEARN_API);
    const pricesPromise = get(
      'https://api.coingecko.com/api/v3/simple/price?ids=curve-dao-token,vecrv-dao-yvault,lp-3pool-curve,yvboost&vs_currencies=usd'
    );
    const [vaultsResponse, pricesResponse] = await Promise.all([vaultsPromise, pricesPromise]);

    const errors: string[] = [];

    // **************** BACKSCRATCHER ****************
    let backscratcherPositions: Position[] | undefined;
    try {
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
      const yveCrvPrice = pricesResponse.data['vecrv-dao-yvault']['usd'];
      const threeCrvPrice = pricesResponse.data['lp-3pool-curve']['usd'];

      const backscratcherDepositPosition: Position = {
        assetAddress: YVECRV,
        tokenAddress: CRV,
        typeId: 'DEPOSIT',
        balance: balanceOf.toString(),
        underlyingTokenBalance: {
          amount: balanceOf.toString(), // TODO: VERIFY IF 1 YVECRV = 1 CRV
          amountUsdc: toBN(normalizeAmount(balanceOf.toString(), backscratcherData.decimals))
            .times(yveCrvPrice)
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

      backscratcherPositions = [backscratcherDepositPosition, backscratcherYieldPosition];
    } catch (error) {
      errors.push('YveCrv positions error');
    }

    // **************** YVBOOST ****************
    let yvBoostPositions: Position[] | undefined;
    try {
      const yvBoostContract = getContract(YVBOOST, yvBoostAbi, provider);
      const yvBoostBalanceOfPromise = yvBoostContract.balanceOf(userAddress);
      const yvBoostPricePerSharePromise = yvBoostContract.pricePerShare();
      const [yvBoostBalanceOf, yvBoostPricePerShare] = await Promise.all([
        yvBoostBalanceOfPromise,
        yvBoostPricePerSharePromise,
      ]);

      const yvBoostData = vaultsResponse.data.find(({ address }: { address: string }) => address === YVBOOST);
      if (!yvBoostData) throw new Error(`yvBoost vault not found on ${YEARN_API} response`);
      const yvBoostPrice = pricesResponse.data['yvboost']['usd'];
      const underlyingBalanceOf = toBN(
        normalizeAmount(
          toBN(yvBoostBalanceOf.toString()).times(yvBoostPricePerShare.toString()).toFixed(0),
          yvBoostData.decimals
        )
      ).toFixed(0);

      const yvBoostDepositPosition: Position = {
        assetAddress: YVBOOST,
        tokenAddress: YVECRV,
        typeId: 'DEPOSIT',
        balance: yvBoostBalanceOf.toString(),
        underlyingTokenBalance: {
          amount: underlyingBalanceOf,
          amountUsdc: toBN(normalizeAmount(yvBoostBalanceOf.toString(), yvBoostData.decimals))
            .times(yvBoostPrice)
            .times(10 ** USDC_DECIMALS)
            .toFixed(0),
        },
        assetAllowances: [],
        tokenAllowances: [],
      };

      yvBoostPositions = [yvBoostDepositPosition];
    } catch (error) {
      errors.push('YvBoost positions error');
    }

    // ********************************
    const positions: Position[] = [];
    [backscratcherPositions, yvBoostPositions].forEach((assetPositions) => {
      if (!assetPositions) return;
      positions.push(...assetPositions);
    });
    return { positions, errors };
  }

  public async getUserLabsMetadata(props: GetUserLabsMetadataProps): Promise<LabUserMetadata[]> {
    throw Error('Not Implemented');
  }

  // ********** WRITE ACTIONS **********

  public async deposit(props: DepositProps): Promise<TransactionResponse> {
    const { network, accountAddress, tokenAddress, vaultAddress, amount, slippageTolerance } = props;
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.deposit(vaultAddress, tokenAddress, amount, accountAddress, {
      slippage: slippageTolerance,
    });
  }

  public async withdraw(props: WithdrawProps): Promise<TransactionResponse> {
    const { network, accountAddress, tokenAddress, vaultAddress, amountOfShares, slippageTolerance } = props;
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.withdraw(vaultAddress, tokenAddress, amountOfShares, accountAddress, {
      slippage: slippageTolerance,
    });
  }

  public async lock(props: StakeProps): Promise<TransactionResponse> {
    const { network, vaultAddress, amount } = props;

    return await this.transactionService.execute({
      network,
      methodName: 'deposit',
      contractAddress: vaultAddress,
      abi: backscratcherAbi,
      args: [amount],
    });
  }

  public async claim(props: ClaimProps): Promise<TransactionResponse> {
    const { network } = props;
    const { CONTRACT_ADDRESSES } = this.config;
    const { YVECRV } = CONTRACT_ADDRESSES;

    return await this.transactionService.execute({
      network,
      methodName: 'claim',
      contractAddress: YVECRV,
      abi: backscratcherAbi,
    });
  }

  public async reinvest(props: ClaimProps): Promise<TransactionResponse> {
    const { network } = props;
    const { CONTRACT_ADDRESSES } = this.config;
    const { y3CrvBackZapper } = CONTRACT_ADDRESSES;

    return await this.transactionService.execute({
      network,
      methodName: 'zap',
      contractAddress: y3CrvBackZapper,
      abi: y3CrvBackZapperAbi,
    });
  }
}
