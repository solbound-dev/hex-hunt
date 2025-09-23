import { useEffect, useState } from 'react';
import c from './style.module.css';
import {
  Hex,
  HEX_SIZE,
  hexToPixel,
  inverseIsometricTransformation,
  isInGrid,
  isSameMove,
  pixelToHex,
  type GameData,
} from './calculation-utils';
import { repaint } from './draw-utils';

import { isNeighbor } from './utils';
import {
  useInitializeGame,
  useInitializeSockets,
  useTimer,
} from './game-hooks';
import { GameStatus } from './GameStatus';

const Game = () => {
  const [gameId, setGameId] = useState('');
  const [gameState, setGameState] = useState<GameData>();
  const [isShooting, setIsShooting] = useState(false);
  const [madeMove, setMadeMove] = useState(false);
  const [isCanvasHovered, setIsCanvasHovered] = useState(false);
  const [hoveredHex, setHoveredHex] = useState<Hex | null>(null);

  const {
    astronautImgRef,
    alienImgRef,
    robotImgRef,
    wizardImgRef,
    cardImgRef,
    skullImgRef,
    canvasRef,
    contextRef,
  } = useInitializeGame();

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
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const { x, y } = inverseIsometricTransformation(mouseX, mouseY, HEX_SIZE);

      let nearest: Hex | null = null;
      let minDist = Infinity;

      if (!gameState) return;
      for (const h of gameState.grid) {
        const center = hexToPixel(h);
        const dx = center.x - x;
        const dy = center.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist && dist < HEX_SIZE) {
          nearest = h;
          minDist = dist;
        }
      }

      setHoveredHex(nearest);
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    repaint(
      contextRef,
      canvasRef,
      socketRef,
      astronautImgRef,
      alienImgRef,
      robotImgRef,
      wizardImgRef,
      cardImgRef,
      skullImgRef,
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
    alienImgRef,
    astronautImgRef,
    canvasRef,
    cardImgRef,
    contextRef,
    robotImgRef,
    skullImgRef,
    wizardImgRef,
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
    const ox = event.clientX - rect.left;
    const oy = event.clientY - rect.top;

    const { x, y } = inverseIsometricTransformation(ox, oy, HEX_SIZE);

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
