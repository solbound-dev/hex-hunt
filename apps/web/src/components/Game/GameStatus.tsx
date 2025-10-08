import type { DefaultEventsMap } from '@socket.io/component-emitter';
import c from './style.module.css';
import type { Socket } from 'socket.io-client';
import type { GameData } from '../../utils/calculation-utils';
import { colors } from '../../utils/draw-utils';
import { useQueryClient } from '@tanstack/react-query';

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
        {/* <input
          disabled={!!gameState?.started}
          className={c.input}
          type='text'
          placeholder='gameId'
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
        /> */}
        <h3>gameId: {gameId}</h3>
        {/* <button
          className={c.button}
          onClick={() => {
            console.log('joingame');
            socketRef.current?.emit('joinGame', { gameId: gameId, tier: 1 });
            queryClient.invalidateQueries({ queryKey: ['games'] });
          }}
          disabled={!gameId}>
          Enter game{' '}
        </button>{' '} */}
        <button
          className={c.button}
          onClick={() => {
            socketRef.current?.emit('start', { gameId: gameId });
            queryClient.invalidateQueries({ queryKey: ['games'] });
          }}
          disabled={gameState?.started || !gameId}>
          Start game
        </button>
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
      <div className={c.gameInfoContainer}>
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
