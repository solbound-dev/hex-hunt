import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import p5 from 'p5';
import { initializeGame, draw, mousePressed, updateUI } from './game-utils';
// Constants
const HEX_SIZE = 50;
const CANVAS_SIZE = 800;
const DEBUG = true; // Enabled for debugging
const FLASH_DURATION = 1000; // 1 second total
const FLASH_CYCLES = 5; // 5 flashes
const FLASH_INTERVAL = FLASH_DURATION / (FLASH_CYCLES * 2); // 100ms per half-cycle

function sketch(
  p: p5,
  socketRef: React.MutableRefObject<Socket | null>,
  gameId: string,
  data: any,
) {
  p.setup = function () {
    try {
      p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
      p.noLoop(); // Optimize drawing
      initializeGame(p);
      updateUI();
      //   if (DEBUG)
      //     console.log(
      //       `Canvas initialized, gameState: ${gameState}, Astro: (${astronautPos.q}, ${astronautPos.r}), Alien: (${alienPos.q}, ${alienPos.r}), Card: (${cardPos ? `${cardPos.q}, ${cardPos.r}` : 'none'})`,
      //     );
    } catch (error) {
      console.error('Setup failed:', error.message, error.stack);
    }
  };

  p.draw = () => draw(p);

  p.mousePressed = () => mousePressed(p, socketRef, gameId, data);
}

const Game = () => {
  const p5ContainerRef = useRef(null);
  const socketRef = useRef<Socket | null>(null);
  const [gameId, setGameId] = useState('');
  const [gameState, setGameState] = useState<any>();

  useEffect(() => {
    socketRef.current = io('http://localhost:3005');
    socketRef.current.on('gameFull', () =>
      console.log('This game is already full!'),
    );
    socketRef.current.on('gameStart', () => console.log('Game started!'));
    socketRef.current.on('playerJoined', (data) =>
      console.log('Player joined:', data),
    );
    socketRef.current.on('gameState', (data) => {
      console.log('Received state:', data);
      setGameState(data);
    });
  }, []);
  useEffect(() => {
    if (!socketRef.current) return;
    const p5Instance = new p5(
      (p) => sketch(p, socketRef, gameId, gameState),
      p5ContainerRef.current!,
    );

    return () => {
      p5Instance.remove();
    };
  }, [gameId, gameState]);

  return (
    <div>
      <h3>my id: {socketRef.current?.id}</h3>
      <h1>game: {gameId}</h1>
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

      <p>send</p>
      {['1', '2', '3', '4'].map((el) => (
        <button
          key={el}
          onClick={() => {
            socketRef.current?.emit('updateGame', {
              gameId: gameId,
              move: el,
            });
          }}>
          {el}
        </button>
      ))}
      <div style={{ width: '500px' }}>{JSON.stringify(gameState)}</div>
      <div style={{ width: '800px' }} ref={p5ContainerRef}>
        <div className='ui-container' id='ui'>
          <div id='astronaut-score'>
            Astro Rounds: <span className='score-number'>0</span>
          </div>
          <div id='alien-score'>
            Alien Rounds: <span className='score-number'>0</span>
          </div>
          <div id='astronaut-cards' className='card-counter'></div>
          <div id='alien-cards' className='card-counter'></div>
        </div>
        <div style={{ width: '800px', height: '800px' }} id='cover'>
          Astro turn(Click to continue)
        </div>
        <div id='debug'></div>
        <button id='startBtn'>Shoot</button>
        <button id='restartBtn'>Restart</button>
        <button id='infoBtn'>i</button>
        <div id='infoDrawer'>
          <button id='closeInfoBtn'>Close</button>
          <h2>Hex Hunt Rules</h2>
          <ul>
            <li>
              Players: Astro (blue) and Alien (red) take turns moving on a hex
              grid.
            </li>
            <li>Move: Click an adjacent hex to move your character.</li>
            <li>
              Shoot: Click "Shoot" and select an adjacent hex to fire in that
              direction.
            </li>
            <li>
              Cards: Collect a card (yellow) by moving onto it to gain one-time
              immunity from shots.
            </li>
            <li>
              Win: Collect 3 cards or shoot your opponent to win the round.
            </li>
            <li>
              Collision: If both players move to the same hex, they bounce back
              to their previous positions, and the hex is marked as last known
              for both.
            </li>
            <li>
              Zone: Every 8 moves, the grid shrinks. Players outside the zone
              lose.
            </li>
            <li>
              Visibility: Opponents are only visible at their last known
              position (when they shoot or collect a card).
            </li>
            <li>
              Turn: Astro moves/shoots, then Alien. Shots resolve after both
              players move.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Game;
