import { useEffect, useRef, useState } from 'react';
import { generateGrid, Hex, HEX_SIZE, pixelToHex } from './calculation-utils';
import clsx from 'clsx';
import {
  drawCard,
  drawDeadPlayer,
  drawDisappearedHexes,
  drawGrid,
  drawLastSeenPlayer,
  drawPlayer,
  drawShootHighlight,
  drawZoneContractionWarning,
} from './draw-utils';
import { io, type Socket } from 'socket.io-client';

function getPlayerType(
  socketId: string | undefined | null,
  astronautId: string | null,
  alienId: string | null,
) {
  if (!socketId || !astronautId || !alienId) return '';
  if (socketId === astronautId) return 'Astronaut';
  else if (socketId === alienId) return 'Alien';
  else return '';
}

const CanvasTest = () => {
  const canvasRef = useRef<any>(null);
  const contextRef = useRef<any>(null);

  const socketRef = useRef<Socket | null>(null);
  const [gameId, setGameId] = useState('');
  const [gameState, setGameState] = useState<any>();
  const [isShooting, setIsShooting] = useState(false);

  const currentRadius = 3;

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 800 * 2;
    canvas.height = 800 * 2;
    canvas.style.width = `${800}px`;
    canvas.style.height = `${800}px`;
    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.strokeStyle = 'white';
    context.lineWidth = '1';
    contextRef.current = context;

    drawGrid(contextRef.current, generateGrid(currentRadius));
  }, []);

  useEffect(() => {
    socketRef.current = io('http://localhost:3005');
    socketRef.current.on('gameFull', () =>
      console.log('This game is already full!'),
    );

    socketRef.current.on('gameStart', (data) => {
      console.log('Game started! Data:', socketRef.current?.id, data);
      drawPlayer(contextRef.current, data.astronautPos, true, HEX_SIZE);
      drawPlayer(contextRef.current, data.alienPos, false, HEX_SIZE);
      drawCard(contextRef.current, data.cardPos);

      setGameState(data);
    });

    socketRef.current.on('playerJoined', (data) =>
      console.log('Player joined:', data),
    );
    socketRef.current.on('gameState', (data) => {
      setGameState(data);

      contextRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
      drawGrid(contextRef.current, generateGrid(currentRadius));

      console.log(data);
      if (socketRef.current?.id === data.astronautId) {
        drawPlayer(contextRef.current, data.astronautPos, true, HEX_SIZE);
      } else if (socketRef.current?.id === data.alienId) {
        drawPlayer(contextRef.current, data.alienPos, false, HEX_SIZE);
      }
      if (socketRef.current?.id === data.alienId) {
        drawLastSeenPlayer(
          contextRef.current,
          data.lastSeenAstronautPos,
          true,
          HEX_SIZE,
        );
      } else if (socketRef.current?.id === data.astronautId) {
        drawLastSeenPlayer(
          contextRef.current,
          data.lastSeenAlienPos,
          false,
          HEX_SIZE,
        );
      }

      drawCard(contextRef.current, data.cardPos);
      drawDisappearedHexes(contextRef.current, data.disappearedHexes, HEX_SIZE);

      if ((data.moves + 2) % 4 === 0) {
        drawZoneContractionWarning(
          contextRef.current,
          data.grid,
          data.currentRadius,
          HEX_SIZE,
        );
      }

      if (data.isAstronautDead) {
        drawDeadPlayer(contextRef.current, data.astronautPos, HEX_SIZE);
      }
      if (data.isAlienDead) {
        drawDeadPlayer(contextRef.current, data.alienPos, HEX_SIZE);
      }

      setIsShooting(false);
    });
  }, []);

  useEffect(() => {
    if (isShooting) {
      const pos =
        socketRef.current?.id === gameState?.astronautId
          ? new Hex(gameState.astronautPos.q, gameState.astronautPos.r)
          : new Hex(gameState.alienPos.q, gameState.alienPos.r);

      drawShootHighlight(contextRef.current, pos, gameState.grid, HEX_SIZE);
    } else if (
      gameState?.astronautId &&
      gameState?.alienId &&
      gameState?.cardPos
    ) {
      contextRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
      drawGrid(contextRef.current, generateGrid(currentRadius));

      if (socketRef.current?.id === gameState.astronautId) {
        drawPlayer(contextRef.current, gameState.astronautPos, true, HEX_SIZE);
      } else if (socketRef.current?.id === gameState.alienId) {
        drawPlayer(contextRef.current, gameState.alienPos, false, HEX_SIZE);
      }
      if (socketRef.current?.id === gameState.alienId) {
        drawLastSeenPlayer(
          contextRef.current,
          gameState.lastSeenAstronautPos,
          true,
          HEX_SIZE,
        );
      } else if (socketRef.current?.id === gameState.astronautId) {
        drawLastSeenPlayer(
          contextRef.current,
          gameState.lastSeenAlienPos,
          false,
          HEX_SIZE,
        );
      }
      drawCard(contextRef.current, gameState.cardPos);
      drawDisappearedHexes(
        contextRef.current,
        gameState.disappearedHexes,
        HEX_SIZE,
      );

      if ((gameState.moves + 2) % 4 === 0) {
        drawZoneContractionWarning(
          contextRef.current,
          gameState.grid,
          gameState.currentRadius,
          HEX_SIZE,
        );
      }

      if (gameState.isAstronautDead) {
        drawDeadPlayer(contextRef.current, gameState.astronautPos, HEX_SIZE);
      }
      if (gameState.isAlienDead) {
        drawDeadPlayer(contextRef.current, gameState.alienPos, HEX_SIZE);
      }
    }
  }, [isShooting]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    socketRef.current?.emit('updateGame', {
      gameId,
      move: pixelToHex(x, y),
      isShooting: isShooting,
    });
  };

  return (
    <div>
      <div>
        <h3>my id: {socketRef.current?.id}</h3>
        <h1>game: {gameId}</h1>
        <h2>
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
        </h2>
        <p>astronaut cards: {gameState?.astronautCards || 0}</p>
        <p>alien cards: {gameState?.alienCards || 0}</p>
        <div>
          {['a', 'b', 'c', 'd'].map((game) => (
            <button
              key={game}
              onClick={() => {
                setGameId(game);
                socketRef.current?.emit('joinGame', { gameId: game });
              }}>
              {game}
            </button>
          ))}
        </div>
        <div>
          <button
            onClick={() => {
              setIsShooting((prev) => !prev);
            }}>
            <h3>{isShooting ? 'Cancel Shooting' : 'Shoot'}</h3>
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} onClick={handleCanvasClick} />
    </div>
  );
};

export default CanvasTest;
