import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Layout } from '@containers';
import { Home } from './Home';
import { Page404 } from './404';

export const Routes = () => {
  return (
    <Router>
      <Layout>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="*">
            <Page404 />
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
};
