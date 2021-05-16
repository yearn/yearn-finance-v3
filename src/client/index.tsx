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
  }

  * {
    box-sizing: border-box;
  }

  body {
    background-color: ${(props) => props.theme.oldColors.shade100};
    color: ${(props) => props.theme.oldColors.shade0};
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

  h1, h2, h3, h4 {
    margin: 0;
    font-weight: 400;
  }

  h1 {
    font-size: 11.7rem;
  }
  h2 {
    font-size: 4.8rem;
  }
  h3 {
    font-size: 3.8rem;
  }
  h4 {
    font-size: 2.6rem;
  }
  .t-subtitle {
    font-size: 1.8rem;
    font-weight: 400;
  }
  .t-body {
    font-size: 1.6rem;
    font-weight: 400;
  }
  .t-body-light {
    font-size: 1.4rem;
    font-weight: 300;
  }
  .t-captions {
    font-size: 1.8rem;
    font-weight: 500;
  }
  .t-captions2 {
    font-size: 1.6rem;
    font-weight: 500;
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
