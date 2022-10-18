import BigNumber from 'bignumber.js';
import { Contract } from 'ethers';

import { GetAddressEnsNameProps, UserService, Web3Provider, Config } from '@types';

// import bluePillNFTAbi from './contracts/bluePillNFT.json';
// import woofyNFTAbi from './contracts/woofyNFT.json';

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

  /* -------------------------------------------------------------------------- */
  /*                                NFT Methods                                 */
  /* -------------------------------------------------------------------------- */

  private async getUserNftContractBalance(userAddress: string, nftContract: Contract): Promise<number> {
    const contractAddress = nftContract.address;
    let starCount;
    // Woofy doesn't have its own starCount method in contract, so use custom function
    switch (contractAddress) {
      case this.config.CONTRACT_ADDRESSES.WOOFYNFT: {
        // starCount = await this.getWoofyStarCount(nftContract);
        break;
      }
      case this.config.CONTRACT_ADDRESSES.BLUEPILLNFT: {
        starCount = await nftContract.starCount();
        starCount = starCount.toNumber();
        break;
      }
      default:
        starCount = 1;
        break;
    }
    const nftIDs = this.generateNftIds(starCount);
    const addressArray = this.generateRepeatedAddresses(starCount, userAddress);
    const balanceArray = await nftContract.balanceOfBatch(addressArray, nftIDs);
    return this.calculateNftBalanceFromBatch(balanceArray);
  }

  private generateNftIds(starCount: number): number[] {
    return Array.from({ length: starCount + 1 }, (_, i) => i);
  }

  private generateRepeatedAddresses(starCount: number, address: string): string[] {
    return Array(starCount + 1).fill(address);
  }

  private calculateNftBalanceFromBatch(batchBalance: BigNumber[]): number {
    let calculatedBalance = batchBalance.map((element: BigNumber) => {
      return element.toNumber();
    });
    return calculatedBalance.filter((x: number) => x === 1).length;
  }
}
