import c from './style.module.css';
// import { WalletConnectButton } from '@solana/wallet-adapter-react-ui';
import Logo from '../../assets/logo-hex.svg';

import useCheckAuth from '../../hooks/useCheckAuth';
import WalletConnectButton from '../../components/WalletConnectButton';
import { useEffect, useState } from 'react';
import Loading from '../../components/Loading';

const LoginPage = () => {
  const [isWalletListOpen, setIsWalletListOpen] = useState(false);
  // const { publicKey, signMessage } = useWallet();
  useCheckAuth();

  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowLoading(false);
    }, 2500);
  }, []);

  return (
    <>
      {' '}
      {showLoading && <Loading />}
      {!showLoading && (
        <div className={c.pageWrapper}>
          <div className={c.walletMultiButton}>
            {/* <WalletMultiButton /> */}

            {/* {publicKey && (
          <Button
            className={c.button}
            onClick={async () => {
              if (!publicKey || !signMessage) return;

              const connectService = new ConnectService();

              const walletAddress = publicKey.toString();
              const messageResponse = await connectService.requestMessage({
                walletAddress,
              });

              const signature = await connectService.createMessageSignature(
                publicKey,
                signMessage,
                messageResponse.message,
              );

              try {
                await connectService.authorizeWalletWithMessage({
                  walletAddress,
                  signature,
                });
              } catch (e) {
                console.log('error', e);
                return;
              }
            }}>
            Login with wallet
          </Button>
        )} */}
          </div>
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
            <WalletConnectButton
              isWalletListOpen={isWalletListOpen}
              setIsWalletListOpen={setIsWalletListOpen}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;
