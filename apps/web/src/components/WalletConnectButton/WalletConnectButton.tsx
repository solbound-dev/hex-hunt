import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Button from '../Button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '../../providers/AuthProvider';

const WalletConnectButton: React.FC = () => {
  const { connected } = useWallet();
  const { authenticateUser } = useAuth();

  return (
    <div>
      {!connected ? (
        <WalletMultiButton />
      ) : (
        <Button onClick={() => authenticateUser()}>Sign message</Button>
      )}
    </div>
  );
};

export default WalletConnectButton;
