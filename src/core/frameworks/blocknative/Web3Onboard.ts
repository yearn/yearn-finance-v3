import { getAddress } from '@ethersproject/address';
import Onboard, { OnboardAPI } from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import ledgerModule from '@web3-onboard/ledger';
import trezorModule from '@web3-onboard/trezor';
import coinbaseWalletModule from '@web3-onboard/coinbase';
import portisModule from '@web3-onboard/portis';
import fortmaticModule from '@web3-onboard/fortmatic';
import torusModule from '@web3-onboard/torus';
import mewWalletModule from '@web3-onboard/mew-wallet';
import gnosisModule from '@web3-onboard/gnosis';
import keystoneModule from '@web3-onboard/keystone';
import uauthModule from '@web3-onboard/uauth';

import { getConfig } from '@config';
import { YearnLogo, YearnLogoFull } from '@src/client/assets/images';
import { getNetworkRpc } from '@utils';
import { Wallet, Subscriptions, Network, Theme } from '@types';

import { injectMetamaskProvider } from '../metamask';

export class Web3OnboardWalletImpl implements Wallet {
  private onboard?: OnboardAPI;
  public selectedAddress: string | undefined;
  public ens: string | undefined;
  public networkVersion: number | undefined;
  public name: string | undefined;
  public provider: any | undefined;

  private getState() {
    return this.onboard?.state.get();
  }

  private getWallet() {
    return this.getState()?.wallets[0];
  }

  get isCreated(): boolean {
    return !!this.onboard;
  }

  get isConnected(): Promise<boolean> {
    return Promise.resolve(!!this.getWallet()?.accounts[0]);
  }

  public create(_network: Network, subscriptions: Subscriptions, theme?: Theme): boolean {
    const {
      SUPPORTED_NETWORKS,
      NETWORK_SETTINGS,
      BLOCKNATIVE_KEY,
      PORTIS_KEY,
      FORTMATIC_KEY,
      UNSTOPPABLE_DOMAINS_ID,
      HOST,
    } = getConfig();

    const injected = injectedModule();
    const walletConnect = walletConnectModule();
    const ledger = ledgerModule();
    const trezor = trezorModule({
      email: 'aaron@blocknative.com',
      appUrl: 'https://reactdemo.blocknative.com',
    });
    const coinbaseWalletSdk = coinbaseWalletModule();
    const portis = portisModule({ apiKey: PORTIS_KEY ?? '' });
    const fortmatic = fortmaticModule({ apiKey: FORTMATIC_KEY ?? '' });
    const torus = torusModule();
    const mewWallet = mewWalletModule();
    const gnosis = gnosisModule();
    const keystone = keystoneModule();
    const uauth = uauthModule({
      clientID: UNSTOPPABLE_DOMAINS_ID ?? '',
      redirectUri: HOST,
      scope: 'openid wallet',
    });

    // NOTE: needed because of https://github.com/MetaMask/metamask-extension/issues/3133
    injectMetamaskProvider();

    this.onboard = Onboard({
      apiKey: BLOCKNATIVE_KEY,
      wallets: [
        injected,
        walletConnect,
        ledger,
        trezor,
        coinbaseWalletSdk,
        portis,
        fortmatic,
        torus,
        mewWallet,
        gnosis,
        keystone,
        uauth,
      ],
      chains: SUPPORTED_NETWORKS.map((network) => {
        const { networkId, name, nativeCurrency } = NETWORK_SETTINGS[network];
        return {
          id: `0x${networkId.toString(16)}`,
          token: nativeCurrency.symbol,
          label: name,
          rpcUrl: getNetworkRpc(network),
        };
      }),
      appMetadata: {
        name: 'Yearn Finance',
        icon: YearnLogo,
        logo: YearnLogoFull,
        description: `Yearn is DeFi's premier yield aggregator. You can put your digital assets to work and receive the best risk-adjusted yields in DeFi.`,
      },
      accountCenter: {
        desktop: {
          enabled: false,
        },
        mobile: {
          enabled: false,
        },
      },
    });

    const walletState = this.onboard.state.select('wallets');
    walletState.subscribe((wallets) => {
      const wallet = wallets.length ? wallets[0] : undefined;
      const selectedAddress = wallet?.accounts[0]?.address ? getAddress(wallet?.accounts[0]?.address) : undefined;
      const ens = wallet?.accounts[0]?.ens?.name;
      const networkVersion = wallet?.chains[0]?.id ? Number(wallet?.chains[0]?.id) : undefined;
      const name = wallet?.label;
      const provider = wallet?.provider;

      if (name !== this.name) {
        this.name = name;
        this.provider = provider;
        if (subscriptions.wallet) subscriptions.wallet({ name, provider, instance: wallet?.instance });
      }

      if (selectedAddress !== this.selectedAddress) {
        this.selectedAddress = selectedAddress;
        if (subscriptions.address) subscriptions.address(selectedAddress);
      }

      if (ens !== this.ens) {
        this.ens = ens;
        if (subscriptions.ens) subscriptions.ens(ens);
      }

      if (networkVersion !== this.networkVersion) {
        this.networkVersion = networkVersion;
        if (subscriptions.network) subscriptions.network(networkVersion);
      }
    });

    return !!this.onboard;
  }

  public async connect(args?: any): Promise<boolean> {
    try {
      const options = args?.name
        ? {
            autoSelect: { label: args?.name, disableModals: true },
          }
        : undefined;
      const wallets = await this.onboard?.connectWallet(options);
      return !!wallets?.length;
    } catch (error) {
      return false;
    }
  }

  public async changeNetwork(network: Network): Promise<boolean> {
    const { NETWORK_SETTINGS } = getConfig();
    const networkSettings = NETWORK_SETTINGS[network];
    const networkId = networkSettings.networkId;

    const isConnected = await this.isConnected;
    if (this.onboard && isConnected) {
      this.onboard.setChain({ chainId: `0x${networkId.toString(16)}` });
    } else {
      return false;
    }

    return true;
  }

  public async addToken(
    tokenAddress: string,
    tokenSymbol: string,
    tokenDecimals: number,
    tokenImage: string
  ): Promise<boolean> {
    try {
      await (this.getWallet()?.provider as any).request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
