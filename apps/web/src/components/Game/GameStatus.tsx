import type { DefaultEventsMap } from '@socket.io/component-emitter';
import c from './style.module.css';
import type { Socket } from 'socket.io-client';
import { colors } from '../../utils/draw-utils';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../Button';
import clsx from 'clsx';
import { useGame } from '../../providers/GameProvider';
import type { Player } from '../../utils/calculation-utils';
import { useLocation } from 'wouter';

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
        <span className={c.timerText}>Waiting for players...</span>
      )}
      <div className={c.gameInfoContainer}>
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
        <h3>gameId: {gameId}</h3>
        {!gameState?.started && numberOfPlayers >= 2 && (
          <Button
            className={c.button}
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
            }}>
            Leave
          </Button>
        }
      </div>
      <div className={clsx(c.gameInfoContainer, c.rightFixed)}>
        {gameState?.players.map((p) => (
          <h3
            key={p.walletId}
            style={{
              color: !p.won ? colors[p.playerType] : 'gold',
              textDecoration: getTextDecoration(p, walletId),
              fontSize: p.won ? '20px' : '16px',
            }}>
            {p.playerType} {p.walletId === walletId ? ' (you)' : ''} | {p.cards}{' '}
            / 3{p.won && ' WON!'}
          </h3>
        ))}
      </div>
    </div>
  );
};
