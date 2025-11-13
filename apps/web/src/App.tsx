import { Toaster } from 'react-hot-toast';
import './App.css';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WalletWrapper from './components/Wallet/WalletProvider';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';
import LoginPage from './pages/LoginPage';
import AuthProvider from './providers/AuthProvider';
import FindGamePage from './pages/FindGamePage';
import GameProvider from './providers/GameProvider';
import WindowSizeProvider from './providers/WindowSizeProvider';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import GamePage from './pages/GamePage';
import AudioProvider from './providers/AudioProvider';

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <ConnectionProvider endpoint={clusterApiUrl('devnet')}>
        <WalletWrapper>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <WindowSizeProvider>
                <AudioProvider>
                  <GameProvider>
                    <Switch>
                      <Route path={'/login'} component={() => <LoginPage />} />
                      <Route
                        path={'/select-game'}
                        component={() => <div>Select Game</div>}
                      />
                      <Route path={'/'} component={() => <FindGamePage />} />
                      <Route path={'/game'} component={() => <GamePage />} />
                      <Route
                        path={'/privacy-policy'}
                        component={() => <PrivacyPolicyPage />}
                      />
                      <Route
                        path={'*'}
                        component={() => <div>Error page</div>}
                      />
                    </Switch>{' '}
                  </GameProvider>
                </AudioProvider>
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
