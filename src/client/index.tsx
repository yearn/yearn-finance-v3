import { Provider } from 'react-redux';

import { getStore } from '@frameworks/redux';
import { Routes } from '@routes';
import { Themable } from '@containers';

const store = getStore();

export const App = () => {
  return (
    <Provider store={store}>
      <Themable>
        <Routes />
      </Themable>
    </Provider>
  );
};

export default App;
