import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { createGlobalStyle } from 'styled-components';

import { Container } from '@container';
import { getStore } from '@frameworks/redux';
import { AppContextProvider, BladeContextProvider, SideMenuContextProvider } from '@context';
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
    background-color: ${(props) => props.theme.colors.shade90};
    color: ${(props) => props.theme.colors.shade0};
    font-size: 1.6rem;
    overflow: hidden;
    overflow-y: scroll;
  }

  #root {
    height: 100%;
  }
`;

const container = new Container();
const store = getStore(container);

export const App = () => {
  return (
    <Provider store={store}>
      <AppContextProvider context={container.context}>
        <SideMenuContextProvider>
          <BladeContextProvider>
            <Themable>
              <GlobalStyle />
              <Suspense fallback={null}>
                <Routes />
              </Suspense>
            </Themable>
          </BladeContextProvider>
        </SideMenuContextProvider>
      </AppContextProvider>
    </Provider>
  );
};

export default App;
