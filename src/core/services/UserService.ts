import BigNumber from 'bignumber.js';
import { Contract, ethers } from 'ethers';
import { fns } from 'fns-helper';

import { GetAddressEnsNameProps, UserService, Web3Provider, NftBalances, Config } from '@types';
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

  public async isFnsName(address) {
    var name = await fns.functions.getNameFromOwner(address);
    console.log('Coolnesssssss  ' + name);
    return [name.toString().split('').length > 0];
  }

  public async getAddressEnsName(props: GetAddressEnsNameProps) {
    console.log('ysjsjsjsjsjsjjse');
    const { address } = props;
    const res = await this.isFnsName(address);
    console.log(res);
    const provider = this.web3Provider.getInstanceOf('ethereum');
    var addressEnsName;
    if (res[0]) {
      addressEnsName = await fns.functions.getNameFromOwner(address);
    } else {
      addressEnsName = await provider.lookupAddress(address);
    }
    return addressEnsName.toString().toLowerCase();
  }

  /* -------------------------------------------------------------------------- */
  /*                                NFT Methods                                 */
  /* -------------------------------------------------------------------------- */
  public async getNftBalance(address: string): Promise<NftBalances> {
    const bluePillNftBalance = await this.getBluePillNftBalance(address);
    const woofyNftBalance = await this.getWoofyNftBalance(address);
    return { bluePillNftBalance: bluePillNftBalance, woofyNftBalance: woofyNftBalance };
  }

  public async getBluePillNftBalance(address: string): Promise<number> {
    const provider = this.web3Provider.getInstanceOf('ethereum');
    const { BLUEPILLNFT } = this.config.CONTRACT_ADDRESSES;
    const bluePillNftContract = getContract(BLUEPILLNFT, bluePillNFTAbi, provider);
    return this.getUserNftContractBalance(address, bluePillNftContract);
  }

  public async getWoofyNftBalance(address: string): Promise<number> {
    const provider = this.web3Provider.getInstanceOf('ethereum');
    const { WOOFYNFT } = this.config.CONTRACT_ADDRESSES;
    const woofyNftContract = getContract(WOOFYNFT, woofyNFTAbi, provider);
    return this.getUserNftContractBalance(address, woofyNftContract);
  }

  private async getUserNftContractBalance(userAddress: string, nftContract: Contract): Promise<number> {
    const contractAddress = nftContract.address;
    let starCount;
    // Woofy doesn't have its own starCount method in contract, so use custom function
    switch (contractAddress) {
      case this.config.CONTRACT_ADDRESSES.WOOFYNFT: {
        starCount = await this.getWoofyStarCount(nftContract);
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

  private async getWoofyStarCount(woofNftContract: Contract): Promise<number> {
    // Call URI Method with increasing ID's until it fails to find starCount
    let moreIdsAvailable = true;
    let knownMax = 2800;
    while (moreIdsAvailable) {
      try {
        await woofNftContract.uri(knownMax);
        knownMax++;
      } catch (error) {
        moreIdsAvailable = false;
      }
    }
    return knownMax - 1;
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
