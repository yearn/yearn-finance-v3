import { Provider } from 'react-redux';
import { createGlobalStyle } from 'styled-components';

import { getStore } from '@frameworks/redux';
import { Routes } from '@routes';
import { Themable } from '@containers';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
  }
`;

const store = getStore();

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
