import { Toaster } from 'react-hot-toast';
import './App.css';
import { Route, Switch } from 'wouter';
import Game from './components/Game';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WalletWrapper from './components/Wallet/WalletProvider';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';
import LoginPage from './pages/LoginPage';
import AuthProvider from './providers/AuthProvider';
import FindGamePage from './pages/FindGamePage';
import GameProvider from './providers/GameProvider';
import WindowSizeProvider from './providers/WindowSizeProvider';
import TutorialPage from './pages/TutorialPage';

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <ConnectionProvider endpoint={clusterApiUrl('devnet')}>
        <WalletWrapper>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <WindowSizeProvider>
                <GameProvider>
                  <Switch>
                    <Route path={'/login'} component={() => <LoginPage />} />
                    <Route
                      path={'/select-game'}
                      component={() => <div>Select Game</div>}
                    />
                    <Route path={'/'} component={() => <FindGamePage />} />
                    <Route path={'/game'} component={() => <Game />} />
                    <Route
                      path={'/tutorial'}
                      component={() => <TutorialPage />}
                    />
                    <Route path={'*'} component={() => <div>Error page</div>} />
                  </Switch>{' '}
                </GameProvider>
              </WindowSizeProvider>
            </AuthProvider>
          </QueryClientProvider>
        </WalletWrapper>
      </ConnectionProvider>
      <Toaster />
    </>
  );
}

export default App;
