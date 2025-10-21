import { useWallet } from '@solana/wallet-adapter-react';
import type { WalletName } from '@solana/wallet-adapter-base';
import Button from '../Button';
import clsx from 'clsx';
import c from './style.module.css';
import SolflareIcon from '../../assets/solflare.png';
// import PhantomIcon from '../../assets/phantom.png';

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
                <img
                  className={c.walletIcon}
                  src={SolflareIcon}
                  alt='solflare'
                />{' '}
                <p className={c.walletName}>Solflare</p>
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default WalletButtons;
