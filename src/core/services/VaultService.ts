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
  UserVaultsSummary,
  GetUserVaultsMetadataProps,
  VaultUserMetadata,
} from '@types';
import { toBN } from '@src/utils';

export class VaultServiceImpl implements VaultService {
  private web3Provider: Web3Provider;
  private yearnSdk: YearnSdk;

  constructor({ web3Provider, yearnSdk }: { web3Provider: Web3Provider; yearnSdk: YearnSdk }) {
    this.web3Provider = web3Provider;
    this.yearnSdk = yearnSdk;
  }

  public async getSupportedVaults({ addresses }: GetSupportedVaultsProps): Promise<Vault[]> {
    const yearn = this.yearnSdk;
    return await yearn.vaults.get(addresses);
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

  public async getUserVaultsSummary({ userAddress }: GetUserVaultsSummaryProps): Promise<UserVaultsSummary> {
    const yearn = this.yearnSdk;
    // return await yearn.vaults.getUserVaultsSummary(userAddress); TODO use when sdk ready.
    return { holdings: '9999999', earnings: '9999999', EYY: '9999999', apyAverage: '99' };
  }

  public async getUserVaultsMetadata(props: GetUserVaultsMetadataProps): Promise<VaultUserMetadata[]> {
    const { userAddress, vaultsAddresses } = props;
    const yearn = this.yearnSdk;
    // return await yearn.vaults.userMetadata(userAddress, vaultsAddresses); TODO use when sdk ready.
    const yvYfiAddress = '0xe14d13d8b3b85af791b2aadd661cdbd5e6097db1';
    const obj: VaultUserMetadata = { assetAddress: yvYfiAddress, earned: '99999999' };
    return [obj];
  }

  public async getExpectedTransactionOutcome(props: GetExpectedTransactionOutcomeProps): Promise<TransactionOutcome> {
    const { sourceTokenAddress, sourceTokenAmount, targetTokenAddress } = props;
    // TODO: REMOVE MOCK DATA AFTER SDK IMPLEMENTATION FINISHED
    const expectedOutcome: TransactionOutcome = {
      sourceTokenAddress,
      sourceTokenAmount,
      targetTokenAddress,
      targetTokenAmount: toBN(sourceTokenAmount).times(1.5).toFixed(0),
      conversionRate: 1.5,
      slippage: 0.01,
    };

    return expectedOutcome;
  }

  public async deposit(props: DepositProps): Promise<TransactionResponse> {
    const { accountAddress, tokenAddress, vaultAddress, amount } = props;
    const yearn = this.yearnSdk;
    return await yearn.vaults.deposit(vaultAddress, tokenAddress, amount, accountAddress);
  }

  public async withdraw(props: WithdrawProps): Promise<TransactionResponse> {
    const { accountAddress, tokenAddress, vaultAddress, amountOfShares } = props;
    const yearn = this.yearnSdk;
    return await yearn.vaults.withdraw(vaultAddress, tokenAddress, amountOfShares, accountAddress);
  }
}
