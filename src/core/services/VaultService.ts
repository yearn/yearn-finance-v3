import { getContract } from '@frameworks/ethers';
import { toBN, normalizeAmount, getProviderType } from '@utils';
import {
  VaultService,
  YearnSdk,
  DepositProps,
  WithdrawProps,
  MigrateProps,
  Position,
  Vault,
  VaultDynamic,
  TransactionResponse,
  GetSupportedVaultsProps,
  GetExpectedTransactionOutcomeProps,
  TransactionOutcome,
  GetUserVaultsSummaryProps,
  VaultsUserSummary,
  GetUserVaultsMetadataProps,
  VaultUserMetadata,
  GetVaultsDynamicDataProps,
  GetUserVaultsPositionsProps,
  Web3Provider,
  TransactionService,
  Config,
} from '@types';
import v2VaultAbi from './contracts/v2Vault.json';
import trustedVaultMigratorAbi from './contracts/trustedVaultMigrator.json';
import triCryptoVaultMigratorAbi from './contracts/triCryptoVaultMigrator.json';

export class VaultServiceImpl implements VaultService {
  private yearnSdk: YearnSdk;
  private web3Provider: Web3Provider;
  private transactionService: TransactionService;
  private config: Config;

  constructor({
    yearnSdk,
    web3Provider,
    transactionService,
    config,
  }: {
    yearnSdk: YearnSdk;
    web3Provider: Web3Provider;
    transactionService: TransactionService;
    config: Config;
  }) {
    this.yearnSdk = yearnSdk;
    this.web3Provider = web3Provider;
    this.transactionService = transactionService;
    this.config = config;
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Fetch Methods                              */
  /* -------------------------------------------------------------------------- */

  public async getSupportedVaults({ network, addresses }: GetSupportedVaultsProps): Promise<Vault[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    const vaults = await yearn.vaults.get(addresses);
    return vaults;
  }

  public async getVaultsDynamicData({ network, addresses }: GetVaultsDynamicDataProps): Promise<VaultDynamic[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.getDynamic(addresses);
  }

  public async getUserVaultsPositions({
    network,
    userAddress,
    vaultAddresses,
  }: GetUserVaultsPositionsProps): Promise<Position[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.positionsOf(userAddress, vaultAddresses);
  }

  public async getUserVaultsSummary({ network, userAddress }: GetUserVaultsSummaryProps): Promise<VaultsUserSummary> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.summaryOf(userAddress);
  }

  public async getUserVaultsMetadata(props: GetUserVaultsMetadataProps): Promise<VaultUserMetadata[]> {
    const { network, userAddress, vaultsAddresses } = props;
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.metadataOf(userAddress, vaultsAddresses);
  }

  public async getExpectedTransactionOutcome(props: GetExpectedTransactionOutcomeProps): Promise<TransactionOutcome> {
    const { network, transactionType, accountAddress, sourceTokenAddress, sourceTokenAmount, targetTokenAddress } =
      props;
    const DEFAULT_SLIPPAGE_SIMULATION = 0.99;
    const yearn = this.yearnSdk.getInstanceOf(network);

    if (network !== 'mainnet') {
      const tokenAddress = transactionType === 'DEPOSIT' ? sourceTokenAddress : targetTokenAddress;
      const priceUsdc = await yearn.tokens.priceUsdc(tokenAddress);
      const tokens = await yearn.vaults.tokens();
      const decimals = tokens.find((token) => token.address === tokenAddress)?.decimals;
      let underlyingTokenAmount = sourceTokenAmount;

      if (transactionType === 'WITHDRAW') {
        const providerType = getProviderType(network);
        const provider = this.web3Provider.getInstanceOf(providerType);
        const vaultContract = getContract(sourceTokenAddress, v2VaultAbi, provider);
        const pricePerShare = await vaultContract.pricePerShare();
        underlyingTokenAmount = toBN(sourceTokenAmount)
          .times(normalizeAmount(pricePerShare.toString(), toBN(decimals).toNumber()))
          .toFixed(0);
      }

      const targetTokenAmountUsdc = toBN(normalizeAmount(underlyingTokenAmount, toBN(decimals).toNumber()))
        .times(priceUsdc)
        .toFixed(0);

      return {
        sourceTokenAddress,
        sourceTokenAmount,
        targetTokenAddress,
        targetTokenAmount: underlyingTokenAmount, // TODO: CALCULATE CORRECTLY IF NEEDED IN UI LATER
        targetTokenAmountUsdc,
        targetUnderlyingTokenAddress: sourceTokenAddress,
        targetUnderlyingTokenAmount: underlyingTokenAmount,
        conversionRate: 1,
        slippage: 0,
      };
    }

    let expectedOutcome: TransactionOutcome;
    switch (transactionType) {
      case 'DEPOSIT':
        expectedOutcome = await yearn.simulation.deposit(
          accountAddress,
          sourceTokenAddress,
          sourceTokenAmount,
          targetTokenAddress,
          { slippage: DEFAULT_SLIPPAGE_SIMULATION }
        );
        break;
      case 'WITHDRAW':
        expectedOutcome = await yearn.simulation.withdraw(
          accountAddress,
          sourceTokenAddress,
          sourceTokenAmount,
          targetTokenAddress,
          { slippage: DEFAULT_SLIPPAGE_SIMULATION }
        );
        break;
      default:
        throw new Error(`getExpectedTransactionOutcome for '${transactionType}' not defined`);
    }

    console.log({ expectedOutcome });

    return expectedOutcome;
  }

  /* -------------------------------------------------------------------------- */
  /*                             Transaction Methods                            */
  /* -------------------------------------------------------------------------- */

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

  public async migrate(props: MigrateProps): Promise<TransactionResponse> {
    const { network, vaultFromAddress, vaultToAddress, migrationContractAddress } = props;
    const { triCryptoVaultMigrator } = this.config.CONTRACT_ADDRESSES;

    const signer = this.web3Provider.getSigner();
    switch (migrationContractAddress) {
      case triCryptoVaultMigrator:
        const triCryptoVaultMigratorContract = getContract(migrationContractAddress, triCryptoVaultMigratorAbi, signer);
        return await this.transactionService.execute({
          network,
          fn: triCryptoVaultMigratorContract.migrate_to_new_vault,
        });

      default:
        const trustedVaultMigratorContract = getContract(migrationContractAddress, trustedVaultMigratorAbi, signer);
        return await this.transactionService.execute({
          network,
          fn: trustedVaultMigratorContract.migrateAll,
          args: [vaultFromAddress, vaultToAddress],
        });
    }
  }
}
