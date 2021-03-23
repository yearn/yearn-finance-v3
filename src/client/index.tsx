import { Provider } from 'react-redux';
import { createGlobalStyle } from 'styled-components';

import { Container } from '@container';
import { getStore } from '@frameworks/redux';
import { Routes } from '@routes';
import { Themable } from '@containers';

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
      <Themable>
        <GlobalStyle />
        <Routes />
      </Themable>
    </Provider>
  );
};

export default App;
