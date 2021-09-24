import { GetAddressEnsNameProps, UserService, Web3Provider } from '@types';

export class UserServiceImpl implements UserService {
  private web3Provider: Web3Provider;

  constructor({ web3Provider }: { web3Provider: Web3Provider }) {
    this.web3Provider = web3Provider;
  }

  public async getAddressEnsName(props: GetAddressEnsNameProps) {
    const { address } = props;
    const provider = this.web3Provider.getInstanceOf('ethereum');

    const addressEnsName = await provider.lookupAddress(address);
    return addressEnsName;
  }
}
