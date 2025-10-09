import type { DefaultEventsMap } from '@socket.io/component-emitter';
import c from './style.module.css';
import type { Socket } from 'socket.io-client';
import type { GameData } from '../../utils/calculation-utils';
import { colors } from '../../utils/draw-utils';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../Button';
import clsx from 'clsx';

type GameStatusProps = {
  gameId: string;
  gameState: GameData | undefined | null;
  timeRemaining: number;
  madeMove: boolean;
  socketRef: React.RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>;
  setGameId: (gameId: string) => void;
  walletId?: string;
};

export const GameStatus: React.FC<GameStatusProps> = ({
  gameId,
  gameState,
  timeRemaining,
  madeMove,
  socketRef,
  walletId,
}) => {
  const queryClient = useQueryClient();

  return (
    <div className={c.statusWrapper}>
      <div className={c.gameInfoContainer}>
        <h3>gameId: {gameId}</h3>
        <Button
          className={c.button}
          onClick={() => {
            socketRef.current?.emit('start', { gameId: gameId });
            queryClient.invalidateQueries({ queryKey: ['games'] });
          }}
          disabled={gameState?.started || !gameId}>
          Start game
        </Button>
        <span className={c.normalText}>{Math.round(timeRemaining / 1000)}</span>
      </div>
      <div className={c.gameInfoContainer}>
        <div
          className={c.madeMoveIndicator}
          style={{
            backgroundColor: madeMove ? 'lightgreen' : 'grey',
          }}></div>
        <h3>my id: {socketRef.current?.id}</h3>
      </div>
      <div className={clsx(c.gameInfoContainer, c.rightFixed)}>
        {gameState?.players.map((p) => (
          <div
            key={p.walletId}
            style={{
              color: colors[p.playerType],
              textDecoration: p.isDead ? 'line-through' : 'none',
              fontWeight: p.walletId === walletId ? 'bold' : 'normal',
              fontSize: p.walletId === walletId ? '24px' : '20px',
            }}>
            {p.playerType} ({p.wins}){p.walletId === walletId ? ' (you)' : ''} |{' '}
            {p.cards} / 3{p.won && ' WON!'}
          </div>
        ))}
      </div>
    </div>
  );
};
