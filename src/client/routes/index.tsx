import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import { Layout } from '@containers';

import { Portfolio } from './Portfolio';
import { VaultDetail } from './VaultDetail';
import { LineDetail } from './LineDetail';
import { Vaults } from './Vaults';
import { Market } from './Market';
import { Settings } from './Settings';
import { Disclaimer } from './Disclaimer';
import { Health } from './Health';

const routesMap = [
  {
    path: '/portfolio',
    component: Portfolio,
  },
  {
    path: '/market',
    component: Market,
  },
  {
    path: '/lines/:lineAddress',
    component: LineDetail,
  },
  {
    path: '/vaults',
    component: Vaults,
  },
  {
    path: '/settings',
    component: Settings,
  },
  {
    path: '/disclaimer',
    component: Disclaimer,
  },
];

export const Routes = () => {
  return (
    <Router basename="/#">
      <Switch>
        <Route exact path="/health" component={Health} />

        <Route>
          <Layout>
            <Switch>
              {routesMap.map((route, index) => (
                <Route key={index} exact path={route.path} component={route.component} />
              ))}
              <Route path="*">
                <Redirect to="/market" />
              </Route>
            </Switch>
          </Layout>
        </Route>
      </Switch>
    </Router>
  );
};
