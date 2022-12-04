import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import { Layout, LayoutAlternate } from '@containers';
import { isVeYfiEnv } from '@utils';

import { Portfolio } from './Portfolio';
import { VaultDetail } from './VaultDetail';
import { Vaults } from './Vaults';
import { Labs } from './Labs';
import { Settings } from './Settings';
import { Disclaimer } from './Disclaimer';
import { Health } from './Health';
import { VotingEscrowPage } from './VotingEscrow';

const routesMap = [
  {
    path: '/portfolio',
    component: Portfolio,
  },
  {
    path: '/vaults',
    component: Vaults,
  },
  {
    path: '/labs',
    component: Labs,
  },
  {
    path: '/settings',
    component: Settings,
  },
  {
    path: '/disclaimer',
    component: Disclaimer,
  },
  {
    path: '/vault/:vaultAddress',
    component: VaultDetail,
  },
];

export const Routes = () => {
  const isVeYfi = isVeYfiEnv();

  return (
    <Router basename="/#">
      <Switch>
        <Route exact path="/health" component={Health} />

        {isVeYfi && (
          <Route>
            <LayoutAlternate>
              <Switch>
                <Route exact path="/" component={VotingEscrowPage} />
                <Route path="*">
                  <Redirect to="/" />
                </Route>
              </Switch>
            </LayoutAlternate>
          </Route>
        )}

        {!isVeYfi && (
          <Route>
            <Layout>
              <Switch>
                {routesMap.map((route, index) => (
                  <Route key={index} exact path={route.path} component={route.component} />
                ))}
                <Route path="*">
                  <Redirect to="/vaults" />
                </Route>
              </Switch>
            </Layout>
          </Route>
        )}
      </Switch>
    </Router>
  );
};
