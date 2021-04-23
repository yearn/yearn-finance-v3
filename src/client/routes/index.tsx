import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { Layout } from '@containers';

// import { Page404 } from './404';
import { Save } from './Save';
import { Invest } from './Invest';
import { Landing } from './Landing';
import { Dashboard } from './Dashboard';
import { VaultDetail } from './VaultDetail';
import { Borrow } from './Borrow';

export const Routes = () => {
  return (
    <Router>
      <Layout>
        <Switch>
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/invest" component={Invest} />
          <Route exact path="/save" component={Save} />
          <Route exact path="/vault/:vaultId" component={VaultDetail} />
          <Route exact path="/borrow" component={Borrow} />
          <Route path="/" component={Landing} />
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
};
