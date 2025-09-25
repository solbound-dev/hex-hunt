import type { DefaultEventsMap } from '@socket.io/component-emitter';
import c from './style.module.css';
import type { Socket } from 'socket.io-client';
import type { GameData } from '../../utils/calculation-utils';
import { colors } from '../../utils/draw-utils';

type GameStatusProps = {
  gameId: string;
  gameState: GameData | undefined;
  timeRemaining: number;
  madeMove: boolean;
  socketRef: React.RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>;
  setGameId: (gameId: string) => void;
};

export const GameStatus: React.FC<GameStatusProps> = ({
  gameId,
  gameState,
  timeRemaining,
  madeMove,
  socketRef,
  setGameId,
}) => {
  return (
    <div className={c.statusWrapper}>
      <div className={c.gameInfoContainer}>
        <input
          className={c.input}
          type='text'
          placeholder='gameId'
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
        />
        <button
          className={c.button}
          onClick={() => {
            socketRef.current?.emit('joinGame', { gameId: gameId });
          }}>
          Enter game{' '}
        </button>{' '}
        <button
          className={c.button}
          onClick={() => {
            socketRef.current?.emit('start', { gameId: gameId });
          }}
          disabled={gameState?.started}>
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
        <h3>Game: {gameId}</h3>
      </div>
      <div className={c.gameInfoContainer}>
        {gameState?.players.map((p) => (
          <div
            key={p.id}
            style={{
              color: colors[p.playerType],
              textDecoration: p.isDead ? 'line-through' : 'none',
              fontWeight: p.id === socketRef.current?.id ? 'bold' : 'normal',
              fontSize: p.id === socketRef.current?.id ? '24px' : '20px',
            }}>
            {p.playerType}
            {p.id === socketRef.current?.id ? ' (you)' : ''} | {p.cards} / 3
          </div>
        ))}
      </div>
    </div>
  );
};
