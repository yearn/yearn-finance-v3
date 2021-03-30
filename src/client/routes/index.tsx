import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { Layout } from '@containers';

// import { Page404 } from './404';
import { Save } from './Save';
import { Landing } from './Landing';

export const Routes = () => {
  return (
    <Router>
      <Layout>
        <Switch>
          <Route exact path="/save">
            <Save />
          </Route>
          <Route path="/">
            <Landing />
          </Route>
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
};
