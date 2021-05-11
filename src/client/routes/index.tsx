import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { Layout } from '@containers';

import { Save } from './Save';
import { Invest } from './Invest';
import { Landing } from './Landing';
import { Dashboard } from './Dashboard';
import { VaultDetail } from './VaultDetail';
import { Borrow } from './Borrow';
import { Vaults } from './Vaults';

const routesMap = [
  {
    path: '/dashboard',
    component: Dashboard,
  },
  {
    path: '/invest',
    component: Invest,
  },
  {
    path: '/Save',
    component: Save,
  },
  {
    path: '/vault/:vaultId',
    component: VaultDetail,
  },
  {
    path: '/borrow',
    component: Borrow,
  },
  {
    path: '/home',
    component: Landing,
  },
  {
    path: '/vaults',
    component: Vaults,
  },
];

export const Routes = () => {
  return (
    <Router>
      <Layout>
        <Switch>
          {routesMap.map((route, index) => (
            <Route key={index} exact path={route.path} component={route.component} />
          ))}

          <Route path="*">
            <Redirect to="/home" />
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
};
