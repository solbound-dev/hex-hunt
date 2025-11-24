import { useEffect } from 'react';
import c from './style.module.css';
import {
    getMousePosition,
    getNearestHex,
    isInGrid,
    isSameMove,
    pixelToHex,
} from '../../utils/calculation-utils';
import { repaint, repaintAnimationLoop } from '../../utils/repaint';
import { isNeighbor } from '../../utils/utils';
import toast from 'react-hot-toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGame } from '../../providers/GameProvider';
import { useInitializeGame } from '../../hooks/game';
import Button from '../Button';
import AnimatedPopup from '../AnimatedPopup';

const Game = () => {
    const { publicKey: walletId } = useWallet();

    const {
        gameId,
        gameState,
        isShooting,
        setIsShooting,
        madeMove,
        setMadeMove,
        isCanvasHovered,
        setIsCanvasHovered,
        hoveredHex,
        setHoveredHex,
        socketRef,
        clickedHex,
        setClickedHex,
        canvasSize,
        hexSize,
        isMovingAnimationActive,
        showPopup,
        setShowPopup,
        popupEvents,
    } = useGame();

    const { imgRef, canvasRef } = useInitializeGame(canvasSize, hexSize);

    useEffect(() => {
        const winner = gameState?.players.find((p) => p.won);
        if (winner) toast.success(`${winner.playerType} WON!`);

        if (gameState?.draw) toast.success('Draw - all players died');
    }, [gameState]);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const handleMouseMove = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();

            const { x, y } = getMousePosition(event, rect, hexSize);
            if (!gameState) return;

            const nearest = getNearestHex(gameState, x, y, canvasSize, hexSize);

            if (!isMovingAnimationActive) {
                setHoveredHex(nearest);
            }
        };
        canvas.addEventListener('mousemove', handleMouseMove);

        if (!gameId || !gameState?.started) return;

        if (!isMovingAnimationActive) {
            repaint(
                canvasRef,
                imgRef,
                gameState,
                isCanvasHovered,
                isShooting,
                hoveredHex,
                clickedHex,
                hexSize,
                canvasSize,
                isMovingAnimationActive,
                true,
                walletId?.toString(),
            );
        } else {
            repaintAnimationLoop(
                canvasRef,
                imgRef,
                gameState,
                isCanvasHovered,
                isShooting,
                hoveredHex,
                clickedHex,
                hexSize,
                canvasSize,
                isMovingAnimationActive,
                walletId?.toString(),
            );
        }

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
        canvasSize,
        hexSize,
        isMovingAnimationActive,
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
        const { x, y } = getMousePosition(event, rect, hexSize);

        const move = pixelToHex(x, y, canvasSize, hexSize);

        if (madeMove) return;

        const currentPlayer = gameState.players.find(
            (p) => p.walletId === walletId?.toString(),
        )!;

        if (!isShooting) {
            if (
                !(
                    isNeighbor(move, currentPlayer.pos) ||
                    isSameMove(move, currentPlayer.pos)
                ) ||
                !isInGrid(move, gameState.grid, gameState.disappearedHexes)
            ) {
                return;
            }
        } else {
            if (
                !isNeighbor(move, currentPlayer.pos) ||
                !isInGrid(move, gameState.grid, gameState.disappearedHexes) ||
                isSameMove(move, currentPlayer.pos)
            ) {
                return;
            }
        }
        setClickedHex(hoveredHex);
        setMadeMove(true);

        socketRef.current?.emit('updateGame', {
            gameId,
            move: pixelToHex(x, y, canvasSize, hexSize),
            isShooting: isShooting,
        });
    };
    const currentPlayer = gameState?.players.find(
        (p) => p.walletId === walletId?.toString(),
    );

    if (!imgRef) return;

    return (
        <div className={c.gameWrapper} style={{ objectFit: 'cover' }}>
            {showPopup && (
                <AnimatedPopup
                    canvasSize={canvasSize}
                    setShowPopup={setShowPopup}
                    events={popupEvents}
                />
            )}

            <div className={c.canvasContainer}>
                <div className={c.rel}>
                    <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        onMouseEnter={() => {
                            if (!isMovingAnimationActive) {
                                setIsCanvasHovered(true);
                            }
                        }}
                        onMouseLeave={() => {
                            if (!isMovingAnimationActive) {
                                setIsCanvasHovered(false);
                            }
                        }}
                    />
                    <div className={c.shootButton}>
                        <Button
                            disabled={
                                madeMove || !gameState || currentPlayer?.isDead
                            }
                            className={c.button}
                            onClick={() => {
                                if (!madeMove) {
                                    setIsShooting(!isShooting);
                                }
                            }}>
                            {isShooting ? 'Cancel Shooting' : 'Shoot'}
                        </Button>
                    </div>
                    {isMovingAnimationActive && <div className={c.cover}></div>}
                </div>
            </div>
        </div>
    );
};

export default Game;
