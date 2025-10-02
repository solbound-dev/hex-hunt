import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import React from 'react';
import {
  authorizeWalletWithMessage,
  createMessageSignature,
  requestMessage,
} from '../../api/game/ConnectService';

const WalletChild = () => {
  const [balance, setBalance] = React.useState<number | null>(0);
  const { connection } = useConnection();
  const { publicKey: walletProviderPublicKey, signMessage } = useWallet();

  React.useEffect(() => {
    const getInfo = async () => {
      if (connection && walletProviderPublicKey) {
        const info = await connection.getAccountInfo(walletProviderPublicKey);
        setBalance(info!.lamports / LAMPORTS_PER_SOL);
      } else {
        setBalance(0);
      }
    };
    getInfo();
  }, [connection, walletProviderPublicKey]);

  if (!walletProviderPublicKey) return <div>Connect your wallet</div>;

  return (
    <>
      <button
        onClick={async () => {
          if (!walletProviderPublicKey || !signMessage) return;

          const walletAddress = walletProviderPublicKey.toString();
          const messageResponse = await requestMessage({
            walletAddress,
          }); //napridbiliNESTONESTO

          const signature = await createMessageSignature(
            walletProviderPublicKey,
            signMessage,
            messageResponse.message,
          );

          console.log('signature', signature);

          await authorizeWalletWithMessage({
            walletAddress,
            signature,
          });
        }}>
        sign
      </button>
      {balance}
    </>
  );
};

export default WalletChild;
