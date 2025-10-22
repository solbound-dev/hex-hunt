import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Button from '../Button';
import WalletButtons from './WalletButtons';

interface Props {
  isWalletListOpen: boolean;
  setIsWalletListOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WalletConnectButton: React.FC<Props> = ({
  isWalletListOpen,
  setIsWalletListOpen,
}) => {
  return (
    <>
      {isWalletListOpen && (
        <div onClick={() => setIsWalletListOpen(false)}></div>
      )}
      <div>
        <WalletMultiButton />
        <Button onClick={() => setIsWalletListOpen((prev) => !prev)}>
          Select Wallet to Start
        </Button>
      </div>
      <WalletButtons
        isWalletListOpen={isWalletListOpen}
        setIsWalletListOpen={setIsWalletListOpen}
      />
    </>
  );
};

export default WalletConnectButton;
