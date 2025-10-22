import c from './style.module.css';
// import { WalletConnectButton } from '@solana/wallet-adapter-react-ui';
import Logo from '../../assets/logo-hex.svg';

import useCheckAuth from '../../hooks/useCheckAuth';
import WalletConnectButton from '../../components/WalletConnectButton';
import { useEffect, useState } from 'react';
import Loading from '../../components/Loading';

const LoginPage = () => {
  // const { publicKey, signMessage } = useWallet();
  useCheckAuth();

  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowLoading(false);
    }, 1500);
  }, []);

  return (
    <>
      {showLoading && <Loading />}
      {!showLoading && (
        <div className={c.pageWrapper}>
          <div className={c.walletMultiButton}></div>
          <div className={c.infoWrapper}>
            <div className={c.flex}>
              <img src={Logo} alt='logo' />{' '}
              <h1 className={c.title}>hextraction</h1>
            </div>
            <p className={c.infoParagraph}>
              Hextraction is a fast, turn-based strategy game on a shifting hex
              grid.Play as an{' '}
              <span className={c.bold}> Astronaut, Alien, Robot,</span> or{' '}
              <span className={c.bold}>Wizard</span> and outsmart your rivals
              before the map collapses. Hexes disappear, time runs out,and only
              the sharpest survive. Easy to learn, endlessly replayable — a
              modern, high-speed twist on classic strategy.
            </p>
            <WalletConnectButton />
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;
