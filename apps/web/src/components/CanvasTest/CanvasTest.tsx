import { useEffect, useRef, useState } from 'react';
import c from './style.module.css';
import {
  generateGrid,
  GRID_RADIUS,
  isInGrid,
  isSameMove,
  pixelToHex,
  type GameData,
} from './calculation-utils';
import { drawGrid, repaintCanvas } from './draw-utils';
import { io, type Socket } from 'socket.io-client';

import {
  getPlayerType,
  isNeighbor,
  setAlienImage,
  setAstronautImage,
  setCanvasRef,
  setCardImage,
  setContextRef,
  setSkullImage,
} from './utils';

const CanvasTest = () => {
  const astronautImgRef = useRef<HTMLImageElement | null>(null);
  const alienImgRef = useRef<HTMLImageElement | null>(null);
  const cardImgRef = useRef<HTMLImageElement | null>(null);
  const skullImgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D>(null);
  const socketRef = useRef<Socket | null>(null);
  const [gameId, setGameId] = useState('');
  const [gameState, setGameState] = useState<GameData>();
  const [isShooting, setIsShooting] = useState(false);
  const [madeMove, setMadeMove] = useState(false);

  useEffect(() => {
    setAstronautImage(astronautImgRef);
    setAlienImage(alienImgRef);
    setCardImage(cardImgRef);
    setSkullImage(skullImgRef);

    const canvas = setCanvasRef(canvasRef);
    const context = canvas!.getContext('2d');
    setContextRef(context, contextRef);
    drawGrid(contextRef.current!, generateGrid(GRID_RADIUS));
  }, []);

  useEffect(() => {
    socketRef.current = io('http://localhost:3005');
    socketRef.current.on('gameFull', () =>
      console.log('This game is already full!'),
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

  useEffect(() => {
    repaintCanvas(
      isShooting,
      contextRef,
      canvasRef,
      socketRef,
      astronautImgRef,
      alienImgRef,
      cardImgRef,
      skullImgRef,
      gameState,
    );
  }, [isShooting, gameState]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (madeMove) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const move = pixelToHex(x, y);

    console.log(!isNeighbor(move, gameState!.astronautPos));

    if (
      gameState?.astronautId === socketRef.current?.id &&
      (!isNeighbor(move, gameState!.astronautPos) ||
        !isInGrid(move, gameState!.grid, gameState!.disappearedHexes) ||
        isSameMove(move, gameState!.astronautPos))
    ) {
      return;
    }

    if (
      gameState?.alienId === socketRef.current?.id &&
      (!isNeighbor(move, gameState!.alienPos) ||
        !isInGrid(move, gameState!.grid, gameState!.disappearedHexes) ||
        isSameMove(move, gameState!.alienPos))
    ) {
      return;
    }
    socketRef.current?.emit('updateGame', {
      gameId,
      move: pixelToHex(x, y),
      isShooting: isShooting,
    });

    setMadeMove(true);
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
          <h1>
            You are{' '}
            <span
              style={{
                color:
                  getPlayerType(
                    socketRef.current?.id,
                    gameState?.astronautId,
                    gameState?.alienId,
                  ) === 'Astronaut'
                    ? 'blue'
                    : 'red',
              }}>
              {getPlayerType(
                socketRef.current?.id,
                gameState?.astronautId,
                gameState?.alienId,
              )}
            </span>
          </h1>
        </div>
        <div className={c.astronautScore}>
          <p className={c.normalText}>
            Astronaut cards: {gameState?.astronautCards || 0} / 3
          </p>
        </div>
        <div className={c.alienScore}>
          <p className={c.normalText}>
            Alien cards: {gameState?.alienCards || 0} / 3
          </p>
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
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} onClick={handleCanvasClick} />
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
