import { Toaster } from 'react-hot-toast';
import './App.css';
import { Route, Switch } from 'wouter';
// import Chat from './components/Chat';
import Game from './components/Game';
import CanvasTest from './components/CanvasTest';

const HomePage = () => {
  return <div>a</div>;
};

function App() {
  return (
    <>
      <Switch>
        <Route path={'/'} component={HomePage} />
        <Route path={'/game'} component={() => <Game />} />
        <Route path={'/canvas-test'} component={() => <CanvasTest />} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
