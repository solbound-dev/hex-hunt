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
import { colors, repaint } from './draw-utils';

import { isNeighbor } from './utils';
import {
  useInitializeGame,
  useInitializeSockets,
  useTimer,
} from './game-hooks';

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
        <div className={c.gameInfoContainer}>
          <div
            className={c.madeMoveIndicator}
            style={{ backgroundColor: madeMove ? 'lightgreen' : 'grey' }}></div>
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
                fontSize: p.id === socketRef.current?.id ? '40px' : '32px',
              }}>
              {p.playerType}
              {p.id === socketRef.current?.id ? ' (you)' : ''} | {p.cards} / 3
            </div>
          ))}
        </div>
        <input
          type='text'
          placeholder='gameId'
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
        />
        <div>
          <button
            className={c.normalText}
            onClick={() => {
              socketRef.current?.emit('joinGame', { gameId: gameId });
            }}>
            Enter game{' '}
          </button>{' '}
          <button
            onClick={() => {
              socketRef.current?.emit('start', { gameId: gameId });
            }}
            disabled={gameState?.started}>
            Start game
          </button>
          <span className={c.normalText}>
            {Math.round(timeRemaining / 1000)}
          </span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseEnter={() => setIsCanvasHovered(true)}
        onMouseLeave={() => setIsCanvasHovered(false)}
      />
      <div>
        <button
          onClick={() => {
            if (!madeMove) setIsShooting((prev) => !prev);
          }}>
          {isShooting ? 'Cancel Shooting' : 'Shoot'}
        </button>
      </div>
    </div>
  );
};

export default Game;
