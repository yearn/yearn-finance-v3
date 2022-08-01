import { Duplex } from 'stream';

import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { initializeProvider } from '@metamask/providers';
// import '@metamask/mobile-provider';

// import MobilePostMessageStream from './ReactNativePostMessageStream';

const isFirefoxDesktopBrowser = () => {
  const userAgent = navigator?.userAgent ?? '';
  const isMobile = /Mobile/i.test(userAgent);
  const isTablet = /Tablet/i.test(userAgent);
  const isFirefox = /Firefox/i.test(userAgent);

  return isFirefox && !isMobile && !isTablet;
};

export const isMetamaskMobileBrowser = () => {
  // Metamask hardcodes user agent used on their mobile app browser
  // https://github.com/MetaMask/metamask-mobile/blob/bcc22b37381fe59200fc560c42c4712b89106309/app/core/AppConstants.js#L35
  const METAMASK_ANDROID_USER_AGENT =
    'Mozilla/5.0 (Linux; Android 10; Android SDK built for x86 Build/OSM1.180201.023) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.92 Mobile Safari/537.36';
  const METAMASK_IOS_USER_AGENT =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/76.0.3809.123 Mobile/15E148 Safari/605.1';

  const userAgent = navigator?.userAgent ?? '';

  return userAgent === METAMASK_ANDROID_USER_AGENT || userAgent === METAMASK_IOS_USER_AGENT;
};

export const injectMetamaskProvider = () => {
  if (window.ethereum) return;

  if (isFirefoxDesktopBrowser()) {
    const metamaskStream = new WindowPostMessageStream({
      name: 'metamask-inpage',
      target: 'metamask-contentscript',
    }) as unknown as Duplex;

    initializeProvider({
      connectionStream: metamaskStream,
      shouldShimWeb3: true,
    });
  }

  // TODO: Workaound for Metamask mobile app doesnt work. Seems "onMessage" function also needs to be injected, but is blocked by CSP
  // https://github.com/MetaMask/metamask-mobile/blob/5ee210a2e59255b5ff626923b1a7db459ad75dae/app/components/Views/BrowserTab/index.js#L1368
  // if (isMetamaskMobileBrowser()) {
  // const metamaskStream = new MobilePostMessageStream({
  //   name: 'metamask-inpage',
  //   target: 'metamask-contentscript',
  // }) as unknown as Duplex;
  // initializeProvider({
  //   connectionStream: metamaskStream,
  //   shouldSendMetadata: false,
  // });
  // OR
  // import('@metamask/mobile-provider');
  // }
};
