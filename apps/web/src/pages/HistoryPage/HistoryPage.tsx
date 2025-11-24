import { useEffect, useState } from 'react';
import { useGetResolvedTurn } from '../../api/history/useGetResolvedTurn';
import Game from '../../components/Game';
import { useGame } from '../../providers/GameProvider';

const HistoryPage = () => {
    const [turnNumber, setTurnNumber] = useState(0);
    const [gameIdString, setGameIdString] = useState(
        '335a54a9-8330-4791-85e8-ca289d3590f6',
    );

    const { setGameState, setGameId, gameId } = useGame();
    const { data: turn } = useGetResolvedTurn(gameId, turnNumber);

    useEffect(() => {
        setGameState(turn);
    }, [setGameId, setGameState, turn]);

    console.log('turn', turn);

    return (
        <div>
            <div style={{ position: 'fixed', top: 10, left: 10, zIndex: 1000 }}>
                <button
                    onClick={() => {
                        setTurnNumber(turnNumber - 1);
                        setGameState(turn);
                    }}>
                    -1
                </button>
                <button
                    onClick={() => {
                        setTurnNumber(turnNumber + 1);
                        setGameState(turn);
                    }}>
                    +1
                </button>
                <span>{turnNumber}</span>
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
