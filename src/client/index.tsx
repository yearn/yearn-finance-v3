import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { createGlobalStyle } from 'styled-components';

import { Container } from '@container';
import { getStore } from '@frameworks/redux';
import { AppContextProvider, BladeContextProvider, NavSideMenuContextProvider } from '@context';
import { Routes } from '@routes';
import { Themable } from '@containers';
import '@i18n';

const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
  }

  html {
    font-size: 62.5%;
    // TODO import font file
    @font-face {
      font-family:'SF Pro Display';
      font-style:normal;
      font-weight:500;
      src:local('☺︎'), url("http://www.apple.com/wss/fonts/SF-Pro-Display/v1/sf-pro-display_medium.woff") format("woff"), url("http://www.apple.com/wss/fonts/SF-Pro-Display/v1/sf-pro-display_medium.ttf") format("truetype");
      /* (C) 2015 Apple Inc. All rights reserved.*/
    }
  }

  * {
    box-sizing: border-box;
  }

  body {
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.secondary};
    font-size: 1.6rem;
    overflow: hidden;
    overflow-y: scroll;
    font-family: ${(props) => props.theme.globalFont};
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

const container = new Container();
const store = getStore(container);

export const App = () => {
  return (
    <Provider store={store}>
      <AppContextProvider context={container.context}>
        <NavSideMenuContextProvider>
          <BladeContextProvider>
            <Themable>
              <GlobalStyle />
              <Suspense fallback={null}>
                <Routes />
              </Suspense>
            </Themable>
          </BladeContextProvider>
        </NavSideMenuContextProvider>
      </AppContextProvider>
    </Provider>
  );
};

export default App;
