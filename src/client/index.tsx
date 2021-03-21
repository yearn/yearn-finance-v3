import { Provider } from 'react-redux';

import { getStore } from '@frameworks/redux';
import { Themable } from '@containers';

const store = getStore();

export const App = () => {
  return (
    <Provider store={store}>
      <Themable>
        <div>Yearn Finance v3</div>
      </Themable>
    </Provider>
  );
};

export default App;
