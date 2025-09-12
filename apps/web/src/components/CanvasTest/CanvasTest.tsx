import { useEffect, useRef, useState } from 'react';
import c from './style.module.css';
import {
  CANVAS_SIZE,
  generateGrid,
  Hex,
  HEX_SIZE,
  pixelToHex,
  type GameData,
} from './calculation-utils';
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

import astronautSrc from '../../assets/astronaut.png';
import alienSrc from '../../assets/alien.png';
import cardSrc from '../../assets/card.png';

function getPlayerType(
  socketId: string | null | undefined,
  astronautId: string | null | undefined,
  alienId: string | null | undefined,
) {
  if (!socketId || !astronautId || !alienId) return '';
  if (socketId === astronautId) return 'Astronaut';
  else if (socketId === alienId) return 'Alien';
  else return '';
}

const CanvasTest = () => {
  const astronautImgRef = useRef<HTMLImageElement | null>(null);
  const alienImgRef = useRef<HTMLImageElement | null>(null);
  const cardImgRef = useRef<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D>(null);

  const socketRef = useRef<Socket | null>(null);
  const [gameId, setGameId] = useState('');
  const [gameState, setGameState] = useState<GameData>();
  const [isShooting, setIsShooting] = useState(false);

  const currentRadius = 3;

  useEffect(() => {
    const astronaut = new Image();
    astronaut.src = astronautSrc;
    astronaut.width = 160;
    astronaut.height = 160;
    astronaut.onload = () => {
      astronautImgRef.current = astronaut;
    };

    const alien = new Image();
    alien.src = alienSrc;
    alien.width = 50;
    alien.height = 50;
    alien.onload = () => {
      alienImgRef.current = alien;
    };

    const card = new Image();
    card.src = cardSrc;
    card.width = 80;
    card.height = 80;
    card.onload = () => {
      cardImgRef.current = card;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas!.width = CANVAS_SIZE * 2;
    canvas!.height = CANVAS_SIZE * 2;
    canvas!.style.width = `${CANVAS_SIZE}px`;
    canvas!.style.height = `${CANVAS_SIZE}px`;
    const context = canvas!.getContext('2d');
    context!.scale(2, 2);
    context!.strokeStyle = 'white';
    context!.lineWidth = 1;
    contextRef.current = context;

    drawGrid(contextRef.current!, generateGrid(currentRadius));
  }, []);

  useEffect(() => {
    socketRef.current = io('http://localhost:3005');
    socketRef.current.on('gameFull', () =>
      console.log('This game is already full!'),
    );

    socketRef.current.on('gameStart', (data) => {
      console.log('Game started! Data:', socketRef.current?.id, data);
      drawPlayer(
        contextRef.current!,
        data.astronautPos,
        true,
        HEX_SIZE,
        astronautImgRef.current!,
      );
      drawPlayer(
        contextRef.current!,
        data.alienPos,
        false,
        HEX_SIZE,
        alienImgRef.current!,
      );
      drawCard(contextRef.current!, data.cardPos, cardImgRef.current!);

      setGameState(data);
    });

    socketRef.current.on('playerJoined', (data) =>
      console.log('Player joined:', data),
    );
    socketRef.current.on('gameState', (data) => {
      setGameState(data);

      contextRef.current!.clearRect(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height,
      );
      drawGrid(contextRef.current!, generateGrid(currentRadius));

      if (socketRef.current?.id === data.astronautId) {
        drawPlayer(
          contextRef.current!,
          data.astronautPos,
          true,
          HEX_SIZE,
          astronautImgRef.current!,
        );
      } else if (socketRef.current?.id === data.alienId) {
        drawPlayer(
          contextRef.current!,
          data.alienPos,
          false,
          HEX_SIZE,
          alienImgRef.current!,
        );
      }
      if (socketRef.current?.id === data.alienId) {
        drawLastSeenPlayer(
          contextRef.current!,
          data.lastSeenAstronautPos,
          HEX_SIZE,
          astronautImgRef.current!,
        );
      } else if (socketRef.current?.id === data.astronautId) {
        drawLastSeenPlayer(
          contextRef.current!,
          data.lastSeenAlienPos,
          HEX_SIZE,
          alienImgRef.current!,
        );
      }

      drawCard(contextRef.current!, data.cardPos, cardImgRef.current!);
      drawDisappearedHexes(
        contextRef.current!,
        data.disappearedHexes,
        HEX_SIZE,
      );

      if ((data.moves + 2) % 4 === 0) {
        drawZoneContractionWarning(
          contextRef.current!,
          data.grid,
          data.currentRadius,
          HEX_SIZE,
        );
      }

      if (data.isAstronautDead) {
        drawDeadPlayer(contextRef.current!, data.astronautPos, HEX_SIZE);
      }
      if (data.isAlienDead) {
        drawDeadPlayer(contextRef.current!, data.alienPos, HEX_SIZE);
      }

      setIsShooting(false);
    });
  }, []);

  useEffect(() => {
    if (isShooting) {
      const pos =
        socketRef.current?.id === gameState?.astronautId
          ? new Hex(gameState!.astronautPos!.q, gameState!.astronautPos!.r)
          : new Hex(gameState!.alienPos!.q, gameState!.alienPos!.r);

      drawShootHighlight(contextRef.current!, pos, gameState!.grid, HEX_SIZE);
    } else if (
      gameState?.astronautId &&
      gameState?.alienId &&
      gameState?.cardPos
    ) {
      contextRef.current!.clearRect(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height,
      );
      drawGrid(contextRef.current!, generateGrid(currentRadius));

      if (socketRef.current?.id === gameState.astronautId) {
        drawPlayer(
          contextRef.current!,
          gameState.astronautPos!,
          true,
          HEX_SIZE,
          astronautImgRef.current!,
        );
      } else if (socketRef.current?.id === gameState.alienId) {
        drawPlayer(
          contextRef.current!,
          gameState.alienPos!,
          false,
          HEX_SIZE,
          alienImgRef.current!,
        );
      }
      if (socketRef.current?.id === gameState.alienId) {
        drawLastSeenPlayer(
          contextRef.current!,
          gameState.lastSeenAstronautPos!,
          HEX_SIZE,
          astronautImgRef.current!,
        );
      } else if (socketRef.current?.id === gameState.astronautId) {
        drawLastSeenPlayer(
          contextRef.current!,
          gameState.lastSeenAlienPos!,
          HEX_SIZE,
          alienImgRef.current!,
        );
      }
      drawCard(contextRef.current!, gameState.cardPos, cardImgRef.current!);
      drawDisappearedHexes(
        contextRef.current!,
        gameState.disappearedHexes,
        HEX_SIZE,
      );

      if ((gameState.moves + 2) % 4 === 0) {
        drawZoneContractionWarning(
          contextRef.current!,
          gameState.grid,
          gameState.currentRadius,
          HEX_SIZE,
        );
      }

      if (gameState.isAstronautDead) {
        drawDeadPlayer(contextRef.current!, gameState.astronautPos!, HEX_SIZE);
      }
      if (gameState.isAlienDead) {
        drawDeadPlayer(contextRef.current!, gameState.alienPos!, HEX_SIZE);
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
        <div className={c.gameInfoContainer}>
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
            setIsShooting((prev) => !prev);
          }}>
          {isShooting ? 'Cancel Shooting' : 'Shoot'}
        </button>
      </div>
    </div>
  );
};

export default CanvasTest;
