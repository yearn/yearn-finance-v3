import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { createGlobalStyle } from 'styled-components';

import { Container } from '@container';
import { getStore } from '@frameworks/redux';
import { AppContextProvider, NavSideMenuContextProvider } from '@context';
import { Routes } from '@routes';
import { Themable } from '@containers';
import '@i18n';
import '@assets/fonts/OxygenFont.css';

const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
  }

  html {
    font-size: 62.5%;
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
  
  p {
    letter-spacing: .015rem;
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

const container = new Container();
const store = getStore(container);

export const App = () => {
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
