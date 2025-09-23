import { Toaster } from 'react-hot-toast';
import './App.css';
import { Route, Switch } from 'wouter';
import Game from './components/Game';

function App() {
  return (
    <>
      <Switch>
        <Route path={'/'} component={() => <Game />} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
