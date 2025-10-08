import { useWallet } from '@solana/wallet-adapter-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ConnectService } from '../api/auth/ConnectService';
import { fetchMe } from '../api/auth/useFetchMe';
import { useLogout } from '../api/auth/useLogout';

interface AuthContextState {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  publicKey: string | null;
  logoutAndDisconnect: VoidFunction;
}

const initialContextValue = {
  isAuthenticated: false,
  isCheckingAuth: false,
  publicKey: null,
  logoutAndDisconnect: () => null,
};

type Props = {
  children: React.ReactNode;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextState>(initialContextValue);

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [initialLoadPassed, setInitialLoadPassed] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { mutateAsync: logout } = useLogout();

  const {
    publicKey: walletProviderPublicKey,
    signMessage,
    wallet,
    connected,
    disconnect,
    connecting,
  } = useWallet();

  useEffect(() => {
    setTimeout(() => {
      setInitialLoadPassed(true);
    }, 1000);
  }, []);

  const logoutAndDisconnect = useCallback(async () => {
    await logout();
    // localStorage.removeItem('isMobileAuth');
    await disconnect();
    queryClient.clear();

    setIsAuthenticated(false);
  }, [disconnect, logout, queryClient]);

  const authenticateUser = useCallback(async () => {
    if (!connected || !walletProviderPublicKey) return;

    setIsCheckingAuth(true);

    try {
      const me = await fetchMe();

      console.log('me', me);

      if (me.id === walletProviderPublicKey.toBase58()) {
        setIsCheckingAuth(false);
        setIsAuthenticated(true);
        setPublicKey(me.id);
      } else {
        await logoutAndDisconnect();
        setIsCheckingAuth(false);
      }
      return;
    } catch (error) {
      console.log(error);
    }

    try {
      const connectService = new ConnectService();

      const walletAddress = walletProviderPublicKey.toString();

      const { message } = await connectService.requestMessage({
        walletAddress,
      });

      if (signMessage && wallet?.adapter.name !== 'Phantom Ledger') {
        const signature = await connectService.createMessageSignature(
          walletProviderPublicKey,
          signMessage,
          message,
        );

        await connectService.authorizeWalletWithMessage({
          walletAddress,
          signature,
        });
      }

      const me = await fetchMe(); // throws an error if wallet is not authorized

      setIsAuthenticated(true);
      setPublicKey(me.id);
    } catch (error: unknown) {
      console.log(error);
      disconnect();

      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  }, [
    connected,
    walletProviderPublicKey,
    signMessage,
    wallet?.adapter.name,
    disconnect,
    logoutAndDisconnect,
  ]);

  useEffect(() => {
    if (!initialLoadPassed || connecting) return;

    if (connected && walletProviderPublicKey) {
      authenticateUser();
    } else {
      logout();
      setIsCheckingAuth(false);
    }
  }, [
    initialLoadPassed,
    walletProviderPublicKey,
    connected,
    authenticateUser,
    logout,
    connecting,
  ]);

  const value = {
    isAuthenticated,
    isCheckingAuth,
    publicKey,
    logoutAndDisconnect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
