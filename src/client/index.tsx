import { Duplex } from 'stream';

import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { createGlobalStyle } from 'styled-components';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { initializeProvider } from '@metamask/providers';
import '@i18n';

import { Container } from '@container';
import { getStore } from '@frameworks/redux';
import { AppContextProvider, NavSideMenuContextProvider } from '@context';
import { Routes } from '@routes';
import { Themable } from '@containers';

import '@assets/fonts/RobotoFont.css';

const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    scroll-behavior: unset;
  }

  html {
    font-size: 62.5%;
  }

  * {
    box-sizing: border-box;
  }

  body {
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.texts};
    font-size: 1.6rem;
    overflow: hidden;
    overflow-y: scroll;
    font-family: ${(props) => props.theme.globalFont};
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, -webkit-text-decoration-color;
    transition-timing-function: cubic-bezier(.4, 0, .2, 1);
    transition-duration: .15s
  }

  #root {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  a {
    text-decoration: none;
    &:visited {
      color: inherit;
    }
  }

  p {
    margin: 0;
  }

  p + p {
    margin-top: 1rem;
  }

  [disabled],
  .disabled {
    opacity: 0.7;
    cursor: default;
    pointer-events: none;
  }

  .bn-onboard-modal {
    z-index: ${(props) => props.theme.zindex.onboardModal}
  }
`;

const isFirefoxDesktopBrowser = () => {
  const userAgent = navigator?.userAgent ?? '';
  const isMobile = /Mobile/i.test(userAgent);
  const isFirefox = /Firefox/i.test(userAgent);

  return isFirefox && !isMobile;
};

const isMetamaskMobileBrowser = () => {
  // Metamask hardcodes user agent used on their mobile app browser
  // https://github.com/MetaMask/metamask-mobile/blob/bcc22b37381fe59200fc560c42c4712b89106309/app/core/AppConstants.js#L35
  const METAMASK_ANDROID_USER_AGENT =
    'Mozilla/5.0 (Linux; Android 10; Android SDK built for x86 Build/OSM1.180201.023) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.92 Mobile Safari/537.36';
  const METAMASK_IOS_USER_AGENT =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/76.0.3809.123 Mobile/15E148 Safari/605.1';

  const userAgent = navigator?.userAgent ?? '';

  return userAgent === METAMASK_ANDROID_USER_AGENT || userAgent === METAMASK_IOS_USER_AGENT;
};

const injectMetamaskProvider = () => {
  if (!window.ethereum && (isFirefoxDesktopBrowser() || isMetamaskMobileBrowser())) {
    const metamaskStream = new WindowPostMessageStream({
      name: 'metamask-inpage',
      target: 'metamask-contentscript',
    }) as unknown as Duplex;
    initializeProvider({
      connectionStream: metamaskStream,
      shouldShimWeb3: true,
    });
  }
};

const container = new Container();
const store = getStore(container);

export const App = () => {
  injectMetamaskProvider();
  return (
    <Provider store={store}>
      <AppContextProvider context={container.context}>
        <NavSideMenuContextProvider>
          <Themable>
            <GlobalStyle />
            <Suspense fallback={null}>
              <Routes />
            </Suspense>
          </Themable>
        </NavSideMenuContextProvider>
      </AppContextProvider>
    </Provider>
  );
};

export default App;
