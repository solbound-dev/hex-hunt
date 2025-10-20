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
        <Button onClick={() => setIsWalletListOpen((prev) => !prev)}>
          Connect wallet
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
