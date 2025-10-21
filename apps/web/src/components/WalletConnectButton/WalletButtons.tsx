import { useWallet } from '@solana/wallet-adapter-react';
import type { WalletName } from '@solana/wallet-adapter-base';
import Button from '../Button';
import clsx from 'clsx';
import c from './style.module.css';

interface Props {
  isWalletListOpen: boolean;
  setIsWalletListOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WalletButtons: React.FC<Props> = ({
  isWalletListOpen,
  setIsWalletListOpen,
}) => {
  const { select } = useWallet();

  const handleWalletClick = () => {
    select('Solflare' as WalletName<'Solflare'>);
  };

  return (
    <>
      <div
        className={clsx(c.modalBackground, {
          [c.active]: isWalletListOpen,
        })}
        onClick={() => setIsWalletListOpen(false)}></div>
      <div>
        <div
          className={clsx(c.modalContainer, { [c.active]: isWalletListOpen })}>
          <h2 className={c.modalTitle}>
            Select a wallet on Solana to continue...
          </h2>
          <ul className={c.ul}>
            <li className={c.li}>
              <Button
                className={c.modalButton}
                onClick={() => handleWalletClick()}>
                Solflare
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default WalletButtons;
