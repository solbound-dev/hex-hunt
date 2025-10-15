import { useLocation } from 'wouter';
import { useAuth } from '../../providers/AuthProvider';
import { useGame } from '../../providers/GameProvider';
import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import c from './style.module.css';

const FindGamePage = () => {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const { socketRef, gameId, gameState } = useGame();
  const [privateGameId, setPrivateGameId] = useState('');
  const [showPrivateGameInput, setShowPrivateGameInput] = useState(false);

  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !isCheckingAuth) {
      navigate('/login');
    }
  }, [isAuthenticated, isCheckingAuth, navigate]);

  useEffect(() => {
    if (gameId || gameState) {
      navigate('/game');
    }
  }, [gameId, gameState, navigate]);

  console.log('isAuthenticated', isAuthenticated, isCheckingAuth);

  return (
    <div className={c.pageWrapper}>
      <div className={c.header}>Find game</div>
      <div className={c.buttonGroup}>
        <Button
          onClick={() => {
            socketRef.current?.disconnect();
            socketRef.current?.connect();
            socketRef.current?.emit('quickJoin', { tier: 1 });
            navigate('/game');
          }}>
          Quick match
        </Button>
        <Button
          onClick={() => {
            socketRef.current?.disconnect();
            socketRef.current?.connect();
            socketRef.current?.emit('hostPrivateGame', { tier: 1 });
            navigate('/game');
          }}>
          Host private game
        </Button>
        <Button onClick={() => setShowPrivateGameInput((prev) => !prev)}>
          Join private game
        </Button>
      </div>
      {showPrivateGameInput && (
        <div className={c.inputWrapper}>
          <input
            className={c.input}
            placeholder='gameId'
            value={privateGameId}
            onChange={(e) => setPrivateGameId(e.target.value)}
          />
          <button
            className={c.joinButton}
            onClick={() => {
              socketRef.current?.disconnect();
              socketRef.current?.connect();
              socketRef.current?.emit('joinPrivateGame', {
                gameId: privateGameId,
                tier: 1,
                isPrivate: true,
              });
              navigate('/game');
            }}>
            Join
          </button>
        </div>
      )}
    </div>
  );
};

export default FindGamePage;
