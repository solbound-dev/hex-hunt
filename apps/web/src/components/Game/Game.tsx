import { useEffect, useState } from 'react';
import c from './style.module.css';
import {
  getMousePosition,
  getNearestHex,
  Hex,
  isInGrid,
  isSameMove,
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

const Game = () => {
  const [gameId, setGameId] = useState('');
  const [gameState, setGameState] = useState<GameData>();
  const [isShooting, setIsShooting] = useState(false);
  const [madeMove, setMadeMove] = useState(false);
  const [isCanvasHovered, setIsCanvasHovered] = useState(false);
  const [hoveredHex, setHoveredHex] = useState<Hex | null>(null);

  const { imgRef, canvasRef } = useInitializeGame();

  const socketRef = useInitializeSockets(
    setGameState,
    setIsShooting,
    setMadeMove,
  );
  const timeRemaining = useTimer(gameState, socketRef, madeMove, gameId);

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

    repaint(
      canvasRef,
      socketRef,
      imgRef,
      gameState,
      isCanvasHovered,
      isShooting,
      hoveredHex,
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
  ]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (madeMove) return;
    if (!gameState) return;
    const playerIsDead = gameState.players.some(
      (p) => p.id === socketRef.current?.id && p.isDead,
    );
    if (playerIsDead) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const { x, y } = getMousePosition(event, rect);

    const move = pixelToHex(x, y);

    const currentPlayer = gameState.players.find(
      (p) => p.id === socketRef.current?.id,
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
        </div>
      </div>
    </div>
  );
};

export default Game;
