import {
  VaultService,
  YearnSdk,
  DepositProps,
  WithdrawProps,
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
} from '@types';

export class VaultServiceImpl implements VaultService {
  private yearnSdk: YearnSdk;

  constructor({ yearnSdk }: { yearnSdk: YearnSdk }) {
    this.yearnSdk = yearnSdk;
  }

  public async getSupportedVaults({ network, addresses }: GetSupportedVaultsProps): Promise<Vault[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    const vaults = await yearn.vaults.get(addresses);
    return vaults.filter((vault) => !vault.metadata.migrationAvailable); // removing old v2 vaults.
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
}
