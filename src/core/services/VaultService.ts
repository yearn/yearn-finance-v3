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
