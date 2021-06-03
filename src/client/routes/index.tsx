import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { Layout } from '@containers';

import { Save } from './Save';
import { Invest } from './Invest';
import { Home } from './Home';
import { VaultDetail } from './VaultDetail';
import { Borrow } from './Borrow';
import { Vaults } from './Vaults';
import { Wallet } from './Wallet';
import { IronBank } from './IronBank';
import { Settings } from './Settings';

const routesMap = [
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
    component: Home,
  },
  {
    path: '/vaults',
    component: Vaults,
  },
  {
    path: '/wallet',
    component: Wallet,
  },
  {
    path: '/ironBank',
    component: IronBank,
  },
  {
    path: '/settings',
    component: Settings,
  },
];

export const Routes = () => {
  return (
    <Router basename="/#">
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
