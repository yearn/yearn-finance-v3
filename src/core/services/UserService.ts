import { GetAddressEnsNameProps, UserService, Web3Provider, NFTBalances, Config } from '@types';
import { getContract } from '@frameworks/ethers';

import bluePillNFTAbi from './contracts/bluePillNFT.json';
import woofyNFTAbi from './contracts/woofyNFT.json';

export class UserServiceImpl implements UserService {
  private web3Provider: Web3Provider;
  private config: Config;

  constructor({ web3Provider, config }: { web3Provider: Web3Provider; config: Config }) {
    this.web3Provider = web3Provider;
    this.config = config;
  }

  public async getAddressEnsName(props: GetAddressEnsNameProps) {
    const { address } = props;
    const provider = this.web3Provider.getInstanceOf('ethereum');

    const addressEnsName = await provider.lookupAddress(address);
    return addressEnsName;
  }

  private async getWoofyNFTBalance(props: GetAddressEnsNameProps): Promise<number> {
    const provider = this.web3Provider.getSigner();
    const { WOOFYNFT } = this.config.CONTRACT_ADDRESSES;
    const woofyNFTContract = getContract(WOOFYNFT, woofyNFTAbi, provider);
    return await Promise.resolve(1);
  }

  private async getBluePillNFTBalance(props: GetAddressEnsNameProps): Promise<number> {
    const provider = this.web3Provider.getSigner();
    const { BLUEPILLNFT } = this.config.CONTRACT_ADDRESSES;
    const bluePillNFTContract = getContract(BLUEPILLNFT, bluePillNFTAbi, provider);
    return await Promise.resolve(1);
  }

  public async getNftBalance(props: GetAddressEnsNameProps): Promise<NFTBalances> {
    return await Promise.resolve({ bluePillNFTBalance: 0, woofyNFTBalance: 0 });
  }
}
