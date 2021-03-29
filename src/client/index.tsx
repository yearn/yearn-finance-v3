import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { createGlobalStyle } from 'styled-components';

import { Container } from '@container';
import { getStore } from '@frameworks/redux';
import { ContextProvider } from '@context';
import { Routes } from '@routes';
import { Themable } from '@containers';
import '@i18n';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
  }
`;

const container = new Container();
const store = getStore(container);

export const App = () => {
  return (
    <Provider store={store}>
      <ContextProvider context={container.context}>
        <Themable>
          <GlobalStyle />
          <Suspense fallback={null}>
            <Routes />
          </Suspense>
        </Themable>
      </ContextProvider>
    </Provider>
  );
};

export default App;
