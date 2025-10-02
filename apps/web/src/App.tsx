import { Toaster } from 'react-hot-toast';
import './App.css';
import { Route, Switch } from 'wouter';
import Game from './components/Game';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WalletWrapper from './components/Wallet/WalletProvider';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <ConnectionProvider endpoint={clusterApiUrl('devnet')}>
        <WalletWrapper>
          <QueryClientProvider client={queryClient}>
            <Switch>
              <Route path={'/'} component={() => <Game />} />
            </Switch>{' '}
          </QueryClientProvider>
        </WalletWrapper>
      </ConnectionProvider>
      <Toaster />
    </>
  );
}

export default App;
