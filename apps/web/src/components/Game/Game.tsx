import { useEffect } from 'react';
import c from './style.module.css';
import {
  getMousePosition,
  getNearestHex,
  isInGrid,
  isSameMove,
  pixelToHex,
} from '../../utils/calculation-utils';
import { repaint } from '../../utils/draw-utils';

import { isNeighbor } from '../../utils/utils';
import { GameStatus } from './GameStatus';
import toast from 'react-hot-toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '../../providers/AuthProvider';
import { useLocation } from 'wouter';
import { useGame } from '../../providers/GameProvider';
import { useInitializeGame } from '../../hooks/game';
import Button from '../Button';

const Game = () => {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const [, navigate] = useLocation();
  if (!isAuthenticated && !isCheckingAuth) {
    navigate('/login');
  }

  const { publicKey: walletId } = useWallet();

  const {
    gameId,
    setGameId,
    gameState,
    isShooting,
    setIsShooting,
    madeMove,
    setMadeMove,
    isCanvasHovered,
    setIsCanvasHovered,
    hoveredHex,
    setHoveredHex,
    timeRemaining,
    socketRef,
    clickedHex,
    setClickedHex,
  } = useGame();

  useEffect(() => {
    if (!gameId || !gameState) {
      navigate('/');
    }
  }, [gameId, gameState, navigate]);

  const { imgRef, canvasRef } = useInitializeGame();

  useEffect(() => {
    const winner = gameState?.players.find((p) => p.won);
    if (winner) toast.success(`${winner.playerType} WON!`);

    if (gameState?.draw) toast.success('Draw - all players died');
  }, [gameState]);

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

    if (!gameId || !gameState?.started) return;

    repaint(
      canvasRef,
      imgRef,
      gameState,
      isCanvasHovered,
      isShooting,
      hoveredHex,
      clickedHex,
      walletId?.toString(),
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
    walletId,
    setHoveredHex,
    gameId,
    madeMove,
    clickedHex,
  ]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (madeMove) return;
    if (!gameState) return;

    const gameHasWinner = gameState.players.some((p) => p.won);
    if (gameHasWinner) return;

    const playerIsDead = gameState.players.some(
      (p) => p.walletId === walletId && p.isDead,
    );
    if (playerIsDead) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const { x, y } = getMousePosition(event, rect);

    const move = pixelToHex(x, y);

    const currentPlayer = gameState.players.find(
      (p) => p.walletId === walletId?.toString(),
    )!;

    if (
      currentPlayer &&
      (!isNeighbor(move, currentPlayer.pos) ||
        !isInGrid(move, gameState.grid, gameState.disappearedHexes) ||
        isSameMove(move, currentPlayer.pos))
    ) {
      return;
    }
    setClickedHex(hoveredHex);
    setMadeMove(true);

    socketRef.current?.emit('updateGame', {
      gameId,
      move: pixelToHex(x, y),
      isShooting: isShooting,
    });
  };

  if (!imgRef) return;

  return (
    <div className={c.gameWrapper} style={{ objectFit: 'cover' }}>
      {/* <Background /> */}
      <GameStatus
        timeRemaining={timeRemaining}
        madeMove={madeMove}
        socketRef={socketRef}
        setGameId={setGameId}
        walletId={walletId?.toString() || ''}
      />

      <div className={c.rel}>
        <div className={c.canvasContainer}>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseEnter={() => setIsCanvasHovered(true)}
            onMouseLeave={() => setIsCanvasHovered(false)}
          />
          <div>
            <Button
              disabled={madeMove || !gameState}
              className={c.button}
              onClick={() => {
                if (!madeMove) setIsShooting(!isShooting);
              }}>
              {isShooting ? 'Cancel Shooting' : 'Shoot'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
