import { useEffect, useRef, useState } from 'react';
import c from './style.module.css';
import {
  generateGrid,
  GRID_RADIUS,
  Hex,
  HEX_SIZE,
  hexToPixel,
  inverseIsometricTransformation,
  isInGrid,
  isSameMove,
  MOVE_DURATION,
  pixelToHex,
  type GameData,
} from './calculation-utils';
import { colors, drawGridIsometric, repaint } from './draw-utils';
import { io, type Socket } from 'socket.io-client';

import {
  isNeighbor,
  setAlienImage,
  setAstronautImage,
  setBackgroundImage,
  setCanvasRef,
  setCardImage,
  setContextRef,
  setRobotImage,
  setSkullImage,
  setWizardImage,
} from './utils';

const CanvasTest = () => {
  const backgroundImgRef = useRef<HTMLImageElement | null>(null);
  const astronautImgRef = useRef<HTMLImageElement | null>(null);
  const alienImgRef = useRef<HTMLImageElement | null>(null);
  const robotImgRef = useRef<HTMLImageElement | null>(null);
  const wizardImgRef = useRef<HTMLImageElement | null>(null);
  const cardImgRef = useRef<HTMLImageElement | null>(null);
  const skullImgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D>(null);
  const socketRef = useRef<Socket | null>(null);
  const [gameId, setGameId] = useState('');
  const [gameState, setGameState] = useState<GameData>();
  const [isShooting, setIsShooting] = useState(false);
  const [madeMove, setMadeMove] = useState(false);
  const [ranOutOfTime, setRanOutOfTime] = useState(false);
  const [isCanvasHovered, setIsCanvasHovered] = useState(false);
  const [hoveredHex, setHoveredHex] = useState<Hex | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(MOVE_DURATION);
  const [eventDate, setEventDate] = useState('');
  const [countdownStarted, setCountdownStarted] = useState(false);

  useEffect(() => {
    setAstronautImage(astronautImgRef);
    setAlienImage(alienImgRef);
    setRobotImage(robotImgRef);
    setWizardImage(wizardImgRef);
    setCardImage(cardImgRef);
    setSkullImage(skullImgRef);
    setBackgroundImage(backgroundImgRef);

    const canvas = setCanvasRef(canvasRef);
    const context = canvas!.getContext('2d');
    setContextRef(context, contextRef);
    drawGridIsometric(contextRef.current!, generateGrid(GRID_RADIUS));
  }, []);

  //sockets init
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
    });
    socketRef.current.on('gameFull', () =>
      console.log('This game already started'),
    );

    socketRef.current.on('gameStart', (data) => {
      console.log('Game started! Data:', socketRef.current?.id, data);
      setGameState(data);
    });

    socketRef.current.on('playerJoined', (data) =>
      console.log('Player joined:', data),
    );
    socketRef.current.on('gameState', (data) => {
      setGameState(data);
      setIsShooting(false);
      setMadeMove(false);
    });
  }, []);

  //reset timer
  useEffect(() => {
    const playerIsDead = gameState?.players.some(
      (p) => p.id === socketRef.current?.id && p.isDead,
    );

    if (playerIsDead) {
      return;
    }

    setEventDate(
      new Date(new Date().getTime() + MOVE_DURATION * 1000).toISOString(),
    );
    if (gameState) {
      setCountdownStarted(true);
    }
  }, [gameState]);

  //timer logic
  useEffect(() => {
    if (countdownStarted && eventDate) {
      const countdownInterval = setInterval(() => {
        const currentTime = new Date().getTime();
        const eventTime = new Date(eventDate).getTime();
        let remainingTime = eventTime - currentTime;
        if (remainingTime <= 0) {
          remainingTime = 0;
          clearInterval(countdownInterval);
          setCountdownStarted(false);
          if (!madeMove) {
            setRanOutOfTime(true);
          }
        }
        setTimeRemaining(remainingTime);
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [countdownStarted, eventDate, timeRemaining, gameId, madeMove]);

  //ran out of time
  useEffect(() => {
    const playerIsDead = gameState?.players.some(
      (p) => p.id === socketRef.current?.id && p.isDead,
    );
    if (ranOutOfTime && !madeMove && !playerIsDead) {
      socketRef.current?.emit('updateGame', {
        gameId,
        move: null,
        isShooting: false,
        didRunOutOfTime: true,
      });
    }
  }, [ranOutOfTime, gameId, madeMove, gameState?.players]);

  //canvas click
  useEffect(() => {
    const canvas = canvasRef.current!;
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Convert mouse coords to board coords
      const { x, y } = inverseIsometricTransformation(mouseX, mouseY, HEX_SIZE);

      // Find nearest hex
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
  }, [isShooting, gameState, isCanvasHovered, hoveredHex]);

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

export default CanvasTest;
