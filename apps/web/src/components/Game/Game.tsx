import { useEffect, useState } from 'react';
import c from './style.module.css';
import {
  getMousePosition,
  getNearestHex,
  Hex,
  isInGrid,
  isSameMove,
  MOVE_DURATION_IN_SECONDS,
  pixelToHex,
  type GameData,
} from '../../utils/calculation-utils';
import { repaint } from '../../utils/draw-utils';

import { isNeighbor } from '../../utils/utils';
import {
  useInitializeGame,
  useInitializeSockets,
  useTimer,
} from '../../hooks/game';
import { GameStatus } from './GameStatus';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';

const Game = () => {
  const [gameId, setGameId] = useState('');
  const [gameState, setGameState] = useState<GameData>();
  const [isShooting, setIsShooting] = useState(false);
  const [madeMove, setMadeMove] = useState(false);
  const [isCanvasHovered, setIsCanvasHovered] = useState(false);
  const [hoveredHex, setHoveredHex] = useState<Hex | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(
    MOVE_DURATION_IN_SECONDS,
  );
  const [availableGames, setAvailableGames] = useState<string[]>([]);
  const [ranOutOfTime, setRanOutOfTime] = useState(false);
  const { imgRef, canvasRef } = useInitializeGame();

  const { publicKey: walletProviderPublicKey } = useWallet();

  const queryClient = useQueryClient();

  const socketRef = useInitializeSockets(
    setGameState,
    setIsShooting,
    setMadeMove,
    setTimeRemaining,
    setRanOutOfTime,
    setAvailableGames,
  );
  useTimer(
    gameState,
    socketRef,
    madeMove,
    gameId,
    timeRemaining,
    setTimeRemaining,
    ranOutOfTime,
    setRanOutOfTime,
  );

  useEffect(() => {
    const winner = gameState?.players.find((p) => p.won);
    if (winner) toast.success(`${winner.playerType} WON!`);

    if (gameState?.draw) toast.success('Draw - all players died');
  }, [gameState]);

  // console.log('AAAA', gameState);

  //canvas click
  useEffect(() => {
    const canvas = canvasRef.current!;
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();

      const { x, y } = getMousePosition(event, rect);
      if (!gameState) return;

      const nearest = getNearestHex(gameState, x, y);

      setHoveredHex(nearest);
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    console.log('rendering canvas', gameState);

    if (!gameState || !imgRef.current) return;
    repaint(
      canvasRef,
      socketRef,
      imgRef,
      gameState,
      isCanvasHovered,
      isShooting,
      hoveredHex,
      walletProviderPublicKey?.toString(),
    );

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [
    isShooting,
    gameState,
    isCanvasHovered,
    hoveredHex,
    canvasRef,
    imgRef,
    socketRef,
    walletProviderPublicKey,
  ]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (madeMove) return;
    if (!gameState) return;

    const gameHasWinner = gameState.players.some((p) => p.won);
    if (gameHasWinner) return;

    const playerIsDead = gameState.players.some(
      (p) => p.id === socketRef.current?.id && p.isDead,
    );
    if (playerIsDead) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const { x, y } = getMousePosition(event, rect);

    const move = pixelToHex(x, y);

    const currentPlayer = gameState.players.find(
      (p) => p.walletId === walletProviderPublicKey?.toString(),
    )!;

    if (
      currentPlayer &&
      (!isNeighbor(move, currentPlayer.pos) ||
        !isInGrid(move, gameState.grid, gameState.disappearedHexes) ||
        isSameMove(move, currentPlayer.pos))
    ) {
      return;
    }
    setMadeMove(true);

    socketRef.current?.emit('updateGame', {
      gameId,
      move: pixelToHex(x, y),
      isShooting: isShooting,
    });
  };

  return (
    <div>
      <div>
        <GameStatus
          gameId={gameId}
          gameState={gameState}
          timeRemaining={timeRemaining}
          madeMove={madeMove}
          socketRef={socketRef}
          setGameId={setGameId}
        />
      </div>
      <div className={c.rel}>
        <div>
          <h3>Available games</h3>
          {availableGames.map((g) => (
            <div className={c.gameContentWrapper} key={g}>
              <span>{g}</span>
              <button
                onClick={() => {
                  setGameId(g);
                  socketRef.current?.emit('joinGame', { gameId: g });
                  queryClient.invalidateQueries({ queryKey: ['games'] });
                }}>
                join
              </button>
            </div>
          ))}
        </div>
        <div className={c.canvasWrapper}>
          {' '}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseEnter={() => setIsCanvasHovered(true)}
            onMouseLeave={() => setIsCanvasHovered(false)}
          />
          <div>
            <button
              disabled={madeMove || !gameState}
              className={c.button}
              onClick={() => {
                if (!madeMove) setIsShooting((prev) => !prev);
              }}>
              {isShooting ? 'Cancel Shooting' : 'Shoot'}
            </button>
            {gameState?.players.some((p) => p.won) && (
              <button
                onClick={() => {
                  console.log('gameState on restart', gameState);
                  console.log('timeRemaining on restart', timeRemaining);
                  socketRef.current?.emit('restartGame', {
                    gameId,
                  });
                }}>
                Restart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
