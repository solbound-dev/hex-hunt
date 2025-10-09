import { useLocation } from 'wouter';
import { useAuth } from '../../providers/AuthProvider';
import { useGame } from '../../providers/GameProvider';
import { useState } from 'react';

const FindGamePage = () => {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const { socketRef } = useGame();
  const [, navigate] = useLocation();
  if (!isAuthenticated && !isCheckingAuth) {
    navigate('/login');
  }

  const [privateGameId, setPrivateGameId] = useState('');
  const [showPrivateGameInput, setShowPrivateGameInput] = useState(false);

  return (
    <>
      <h1>Find game</h1>
      <button
        onClick={() => {
          socketRef.current?.emit('quickJoin', { tier: 1 });
          navigate('/game');
        }}>
        Quick match
      </button>
      <button
        onClick={() => {
          socketRef.current?.emit('hostPrivateGame', { tier: 1 });
          navigate('/game');
        }}>
        Host private game
      </button>
      <button onClick={() => setShowPrivateGameInput((prev) => !prev)}>
        Join private game
      </button>
      {showPrivateGameInput && (
        <div>
          <input
            placeholder='gameId'
            value={privateGameId}
            onChange={(e) => setPrivateGameId(e.target.value)}
          />
          <button
            onClick={() => {
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
    </>
  );
};

export default FindGamePage;
