import { SubscriptionService, SubscriptionProps, YearnSdk } from '@types';

// type SdkModule = 'vaults' | 'tokens' | 'earnings';

export class SubscriptionServiceImpl implements SubscriptionService {
  private yearnSdk: YearnSdk;

  constructor({ yearnSdk }: { yearnSdk: YearnSdk }) {
    this.yearnSdk = yearnSdk;
  }

  public subscribe({ module, event, action }: SubscriptionProps): void {
    // const yearn = this.yearnSdk;
    // const sdkModule = yearn[module as SdkModule];
    // if (!sdkModule) throw new Error(`'${module}' module not implemented on SDK`);
    // if (!sdkModule?.events) throw new Error(`'${module}' module does not support events`);
    // TODO when working on event handler
    // sdkModule.events.on(event, action);
  }

  public unsubscribe({ module, event, action }: SubscriptionProps): void {
    // const yearn = this.yearnSdk;
    // const sdkModule = yearn[module as SdkModule];
    // if (!sdkModule) throw new Error(`'${module}' module not implemented on SDK`);
    // if (!sdkModule?.events) throw new Error(`'${module}' module does not support events`);
    // TODO when working on event handler
    // sdkModule.events.removeListener(event, action);
  }
}
