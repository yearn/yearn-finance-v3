import { Provider } from 'react-redux';

import { getStore } from '@frameworks/redux';

const store = getStore();

export const App = () => {
  return (
    <Provider store={store}>
      <div>Yearn Finance v3</div>
    </Provider>
  );
};

export default App;
