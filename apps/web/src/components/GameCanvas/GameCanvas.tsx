import { useInitializeGame } from '../../hooks/game';
import { useGame } from '../../providers/GameProvider';

type Props = {
    handleCanvasClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
};

const GameCanvas: React.FC<Props> = ({ handleCanvasClick }) => {
    const { canvasSize, hexSize, setIsCanvasHovered, isMovingAnimationActive } =
        useGame();

    const { canvasRef } = useInitializeGame(canvasSize, hexSize);

    return (
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
    );
};

export default GameCanvas;
