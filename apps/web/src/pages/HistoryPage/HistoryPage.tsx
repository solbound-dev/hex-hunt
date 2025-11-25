import { useEffect, useState } from 'react';
import { useGetResolvedTurn } from '../../api/history/useGetResolvedTurn';
import Game from '../../components/Game';
import { useGame } from '../../providers/GameProvider';
import { MOVE_ANIMATION_DURATION_IN_MS } from '../../utils/calculation-utils';
import { useGetMaxTurnNumber } from '../../api/history/useGetMaxTurnNumber';

const HistoryPage = () => {
    const [turnNumber, setTurnNumber] = useState(0);
    const [gameIdString, setGameIdString] = useState(
        '335a54a9-8330-4791-85e8-ca289d3590f6',
    );

    const {
        setGameState,
        setGameId,
        gameId,
        setIsMovingAnimationActive,
        setIsHistoryViewActive,
    } = useGame();

    const { data: totalNumberOfTurns } = useGetMaxTurnNumber(gameId);

    const { data: turn } = useGetResolvedTurn(gameId, turnNumber);

    useEffect(() => {
        setIsHistoryViewActive(true);
    }, [setIsHistoryViewActive]);

    useEffect(() => {
        setGameState(turn);
        if (!(turnNumber === 0)) {
            setIsMovingAnimationActive(true);
        }
        const timeoutId = setTimeout(() => {
            setIsMovingAnimationActive(false);
        }, MOVE_ANIMATION_DURATION_IN_MS);
        return () => clearTimeout(timeoutId);
    }, [setGameId, setGameState, turn, setIsMovingAnimationActive, turnNumber]);

    return (
        <div>
            <div style={{ position: 'fixed', top: 10, left: 10, zIndex: 1000 }}>
                <button
                    onClick={() => {
                        setTurnNumber(turnNumber - 1);
                        setGameState(turn);
                    }}
                    disabled={turnNumber === 0}>
                    -1
                </button>
                <button
                    onClick={() => {
                        setTurnNumber(turnNumber + 1);
                        setGameState(turn);
                    }}
                    disabled={
                        totalNumberOfTurns !== undefined &&
                        turnNumber >= totalNumberOfTurns
                    }>
                    +1
                </button>
                <span>
                    {turnNumber} / {totalNumberOfTurns}
                </span>
                <input
                    type='text'
                    value={gameIdString}
                    onChange={(e) => setGameIdString(e.target.value)}
                />
                <button onClick={() => setGameId(gameIdString)}>
                    get game
                </button>
            </div>
            {<Game />}
        </div>
    );
};

export default HistoryPage;
