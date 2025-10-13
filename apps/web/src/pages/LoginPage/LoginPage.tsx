import WinnerCard from '../../components/WinnerCard';
import c from './style.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { ConnectService } from '../../api/auth/ConnectService';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import useCheckAuth from '../../hooks/useCheckAuth';
import Button from '../../components/Button';

const winners = [
  { id: '88egrVzK5b4cBYJZrNvACPncxtYmRixcmfS5DsFwCDc3', amount: 5 },
  { id: '88egrVzK5b4cBYJZrNvACPncxtYmRixcmfS5DsFwCDc3', amount: 5 },
  { id: '88egrVzK5b4cBYJZrNvACPncxtYmRixcmfS5DsFwCDc3', amount: 5 },
];
const LoginPage = () => {
  const { publicKey, signMessage } = useWallet();
  useCheckAuth();

  return (
    <div className={c.pageWrapper}>
      <div className={c.walletMultiButton}>
        <WalletMultiButton />
        {publicKey && (
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
        )}
      </div>
      <div className={c.infoWrapper}>
        <h1>HEXTRACTION</h1>
        <p>
          Hex Hunt is a fast-paced, turn-based strategy game played on a
          shifting hexagonal grid. Each player takes on a unique role—like
          Astronaut, Alien, Robot, or Wizard—and must carefully plan their moves
          to outmaneuver their opponents. The board itself is dynamic, with
          certain hexes disappearing over time, forcing players to adapt quickly
          and rethink their strategies. At its core, the game is about
          positioning, prediction, and survival: you’ll need to anticipate your
          opponents’ choices, secure safe ground, and seize opportunities before
          they vanish. To add tension, every turn has a strict time limit,
          keeping the pace brisk and the pressure high. With its blend of
          tactical depth and accessibility, Hex Hunt captures the spirit of
          classic games like Chess and Battleship, but with a fresh, modern
          twist. It’s easy to learn but endlessly replayable, making it a
          perfect choice for friends who love clever competition.
        </p>
      </div>
      <div className={c.winnersSection}>
        <h2>Recent winners</h2>
        <div className={c.winnersWrapper}>
          {winners.map((w, i) => (
            <WinnerCard key={i} id={w.id} amount={w.amount} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
