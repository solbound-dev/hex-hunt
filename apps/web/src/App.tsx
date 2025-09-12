import { Toaster } from 'react-hot-toast';
import './App.css';
import { Route, Switch } from 'wouter';
import CanvasTest from './components/CanvasTest';

const HomePage = () => {
  return <div>a</div>;
};

function App() {
  return (
    <>
      <Switch>
        <Route path={'/'} component={HomePage} />
        <Route path={'/canvas-test'} component={() => <CanvasTest />} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
