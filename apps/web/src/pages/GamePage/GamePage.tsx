import { useLocation } from 'wouter';
import { useAuth } from '../../providers/AuthProvider';
import { useEffect } from 'react';
import Game from '../../components/Game';
import { GameStatus } from '../../components/Game/GameStatus';
import { useGame } from '../../providers/GameProvider';

const GamePage = () => {
    const { isAuthenticated, isCheckingAuth } = useAuth();
    const [, navigate] = useLocation();

    const { gameId, gameState } = useGame();

    useEffect(() => {
        if (!isAuthenticated && !isCheckingAuth) {
            navigate('/login');
        }
    }, [isAuthenticated, isCheckingAuth, navigate]);

    useEffect(() => {
        if (!gameId || !gameState) {
            navigate('/');
        }
    }, [gameId, gameState, navigate]);

    return (
        <>
            <GameStatus />
            <Game />
        </>
    );
};

export default GamePage;
