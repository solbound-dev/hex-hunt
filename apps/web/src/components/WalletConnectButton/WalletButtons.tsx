import { useWallet } from '@solana/wallet-adapter-react';
import type { WalletName } from '@solana/wallet-adapter-base';
import Button from '../Button';

interface Props {
  isWalletListOpen: boolean;
  setIsWalletListOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WalletButtons: React.FC<Props> = ({ isWalletListOpen }) => {
  const { select } = useWallet();

  const handleWalletClick = () => {
    select('Solflare' as WalletName<'Solflare'>);
  };

  return (
    <>
      {isWalletListOpen && (
        <div>
          <div>Choose your wallet</div>
          <ul>
            <li>
              <Button onClick={() => handleWalletClick()}>Solflare</Button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default WalletButtons;
