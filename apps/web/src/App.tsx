import { Toaster } from 'react-hot-toast';
import './App.css';
import { Route, Switch } from 'wouter';

const HomePage = () => {
  return <div>a</div>;
};

function App() {
  return (
    <>
      <Switch>
        <Route path={'/'} component={HomePage} />
        <Route
          path={'/some-other-page'}
          component={() => <h1>some other page</h1>}
        />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
