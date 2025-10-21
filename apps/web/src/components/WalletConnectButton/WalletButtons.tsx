import { useWallet } from '@solana/wallet-adapter-react';
import type { WalletName } from '@solana/wallet-adapter-base';
import c from './style.module.css';
import SolflareIcon from '../../assets/solflare.png';
import Modal from '../Modal';
import ModalButton from '../Modal/ModalButton';
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
      <Modal isOpen={isWalletListOpen} setIsOpen={setIsWalletListOpen}>
        <h2 className={c.modalTitle}>
          Select a wallet on Solana to continue...
        </h2>
        <ul className={c.ul}>
          <li className={c.li}>
            <ModalButton
              icon={SolflareIcon}
              name='Solflare'
              iconSize={24}
              handleClick={handleWalletClick}
            />
          </li>
        </ul>
      </Modal>
    </>
  );
};

export default WalletButtons;
