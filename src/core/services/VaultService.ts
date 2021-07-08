import {
  VaultService,
  Web3Provider,
  YearnSdk,
  DepositProps,
  WithdrawProps,
  EthereumAddress,
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
} from '@types';

export class VaultServiceImpl implements VaultService {
  private web3Provider: Web3Provider;
  private yearnSdk: YearnSdk;

  constructor({ web3Provider, yearnSdk }: { web3Provider: Web3Provider; yearnSdk: YearnSdk }) {
    this.web3Provider = web3Provider;
    this.yearnSdk = yearnSdk;
  }

  public async getSupportedVaults({ addresses }: GetSupportedVaultsProps): Promise<Vault[]> {
    const yearn = this.yearnSdk;
    const vaults = await yearn.vaults.get(addresses);
    return vaults.filter((vault) => !vault.metadata.migrationAvailable); // removing old v2 vaults.
  }

  public async getVaultsDynamicData(addresses: string[] | undefined): Promise<VaultDynamic[]> {
    const yearn = this.yearnSdk;
    return await yearn.vaults.getDynamic(addresses);
  }

  public async getUserVaultsPositions({
    userAddress,
    vaultAddresses,
  }: {
    userAddress: EthereumAddress;
    vaultAddresses?: string[];
  }): Promise<Position[]> {
    const yearn = this.yearnSdk;
    return await yearn.vaults.positionsOf(userAddress, vaultAddresses);
  }

  public async getUserVaultsSummary({ userAddress }: GetUserVaultsSummaryProps): Promise<VaultsUserSummary> {
    const yearn = this.yearnSdk;
    return await yearn.vaults.summaryOf(userAddress);
  }

  public async getUserVaultsMetadata(props: GetUserVaultsMetadataProps): Promise<VaultUserMetadata[]> {
    const { userAddress, vaultsAddresses } = props;
    const yearn = this.yearnSdk;
    return await yearn.vaults.metadataOf(userAddress, vaultsAddresses);
  }

  public async getExpectedTransactionOutcome(props: GetExpectedTransactionOutcomeProps): Promise<TransactionOutcome> {
    const { transactionType, accountAddress, sourceTokenAddress, sourceTokenAmount, targetTokenAddress } = props;
    const DEFAULT_SLIPPAGE_SIMULATION = 0.99;
    const yearn = this.yearnSdk;
    let expectedOutcome: TransactionOutcome;
    switch (transactionType) {
      case 'DEPOSIT':
        expectedOutcome = await yearn.simulation.deposit(
          accountAddress,
          sourceTokenAddress,
          sourceTokenAmount,
          targetTokenAddress,
          DEFAULT_SLIPPAGE_SIMULATION
        );
        break;
      case 'WITHDRAW':
        expectedOutcome = await yearn.simulation.withdraw(
          accountAddress,
          sourceTokenAddress,
          sourceTokenAmount,
          targetTokenAddress,
          DEFAULT_SLIPPAGE_SIMULATION
        );
        break;
      default:
        throw new Error(`getExpectedTransactionOutcome for '${transactionType}' not defined`);
    }

    console.log({ expectedOutcome });

    return expectedOutcome;
  }

  public async deposit(props: DepositProps): Promise<TransactionResponse> {
    const { accountAddress, tokenAddress, vaultAddress, amount, slippageTolerance } = props;
    const yearn = this.yearnSdk;
    return await yearn.vaults.deposit(vaultAddress, tokenAddress, amount, accountAddress, {
      slippage: slippageTolerance,
    });
  }

  public async withdraw(props: WithdrawProps): Promise<TransactionResponse> {
    const { accountAddress, tokenAddress, vaultAddress, amountOfShares, slippageTolerance } = props;
    const yearn = this.yearnSdk;
    return await yearn.vaults.withdraw(vaultAddress, tokenAddress, amountOfShares, accountAddress, {
      slippage: slippageTolerance,
    });
  }
}
