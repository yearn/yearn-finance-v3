import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { Layout } from '@containers';

import { Portfolio } from './Portfolio';
import { VaultDetail } from './VaultDetail';
import { Vaults } from './Vaults';
import { Labs } from './Labs';
import { IronBank } from './IronBank';
import { Settings } from './Settings';
import { Disclaimer } from './Disclaimer';
import { Health } from './Health';

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
    path: '/ironBank',
    component: IronBank,
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

export const AppRoutes = () => {
  return (
    <Router basename="/#">
      <Routes>
        <Route path="/health" element={Health} />

        <Route>
          <Layout>
            <Routes>
              {routesMap.map((route, index) => (
                <Route key={index} path={route.path} element={route.component} />
              ))}
              <Route path="*">
                <Navigate to="/portfolio" replace />
              </Route>
            </Routes>
          </Layout>
        </Route>
      </Routes>
    </Router>
  );
};
