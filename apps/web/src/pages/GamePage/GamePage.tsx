import { useLocation } from 'wouter';
import { useAuth } from '../../providers/AuthProvider';
import { useEffect } from 'react';
import Game from '../../components/Game';
import { GameStatus } from '../../components/Game/GameStatus';

const GamePage = () => {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !isCheckingAuth) {
      navigate('/login');
    }
  }, [isAuthenticated, isCheckingAuth, navigate]);

  return (
    <>
      <GameStatus />
      <Game />
    </>
  );
};

export default GamePage;
