import { Toaster } from 'react-hot-toast';
import './App.css';
import { Route, Switch } from 'wouter';
import Game from './components/Game';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Switch>
          <Route path={'/'} component={() => <Game />} />
        </Switch>{' '}
      </QueryClientProvider>

      <Toaster />
    </>
  );
}

export default App;
