import clsx from 'clsx';
import c from './style.module.css';
import type { ReactNode } from 'react';

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: ReactNode;
  hasFullHeight?: boolean;
}

const Modal: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  children,
  hasFullHeight,
}) => {
  return (
    <>
      <div
        className={clsx(c.modalBackground, {
          [c.active]: isOpen,
        })}
        onClick={() => setIsOpen(false)}></div>
      <div
        className={clsx(c.modalContainer, {
          [c.active]: isOpen,
          [c.h100]: hasFullHeight,
        })}>
        {children}
        {/* <h2 className={c.modalTitle}>
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
          </ul> */}
      </div>
    </>
  );
};

export default Modal;
