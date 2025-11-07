import type { DefaultEventsMap } from '@socket.io/component-emitter';
import c from './style.module.css';
import type { Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../Button';
import { useGame } from '../../providers/GameProvider';
import { useLocation } from 'wouter';
import DarkContainer from '../DarkContainer';
import type { Player } from '../../utils/Player';

const getColor = (time: number) => {
  if (time > 5000) return 'lightgreen';
  if (time > 2000) return 'orange';
  return 'red';
};

const getTextDecoration = (p: Player, walletId: string | undefined) => {
  if (p.isDead) return 'line-through';
  if (p.walletId === walletId) return 'underline';
  return 'none';
};

type GameStatusProps = {
  timeRemaining: number;
  madeMove: boolean;
  socketRef: React.RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>;
  setGameId: (gameId: string) => void;
  walletId?: string;
};

export const GameStatus: React.FC<GameStatusProps> = ({
  timeRemaining,
  madeMove,
  socketRef,
  walletId,
}) => {
  const queryClient = useQueryClient();

  const { gameState, gameId, setGameId, setGameState, setClickedHex } =
    useGame();

  const [, navigate] = useLocation();

  const gameContainsWinner = gameState?.players.some((p) => p.won);

  let numberOfPlayers = 0;
  if (gameState?.players) {
    numberOfPlayers = gameState.players.length;
  }

  return (
    <div className={c.statusWrapper}>
      {gameState?.started && !gameState.draw && !gameContainsWinner && (
        <span
          className={c.timerText}
          style={{ color: getColor(timeRemaining) }}>
          {Math.round(timeRemaining / 1000)}
        </span>
      )}
      {!gameState?.started && (
        <DarkContainer className={c.fixedTop}>
          <span className={c.fs12}>Waiting for players...</span>
        </DarkContainer>
      )}
      <DarkContainer>
        <div className={c.flex}>
          {gameState?.started && !gameState.draw && !gameContainsWinner && (
            <div
              className={c.madeMoveIndicator}
              style={{
                backgroundColor: madeMove ? 'lightgreen' : 'grey',
              }}
            />
          )}
        </div>
        <div>Game code: {gameId}</div>
        {!gameState?.started && numberOfPlayers >= 2 && (
          <Button
            className={c.startGameButton}
            onClick={() => {
              socketRef.current?.emit('start', { gameId: gameId });
              queryClient.invalidateQueries({ queryKey: ['games'] });
            }}>
            Start game
          </Button>
        )}
        {
          <Button
            onClick={() => {
              socketRef.current?.emit('leaveGame', { gameId });
              setGameId('');
              setGameState(null);
              setClickedHex(null);
              navigate('/');
            }}
            className={c.leaveButton}>
            Leave
          </Button>
        }
      </DarkContainer>
      <DarkContainer className={c.rightFixed}>
        {gameState?.players.map((p) => (
          <div
            key={p.walletId}
            style={{
              textDecoration: getTextDecoration(p, walletId),
              fontSize: p.won ? '20px' : '16px',
            }}>
            {p.playerType} {p.walletId === walletId ? ' (you)' : ''} | {p.cards}{' '}
            / 3{p.won && ' WON!'}
          </div>
        ))}
      </DarkContainer>
      {/* </div> */}
    </div>
  );
};
