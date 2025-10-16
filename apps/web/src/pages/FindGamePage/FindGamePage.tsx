import { useLocation } from 'wouter';
import { useAuth } from '../../providers/AuthProvider';
import { useGame } from '../../providers/GameProvider';
import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import c from './style.module.css';
import clsx from 'clsx';

const FindGamePage = () => {
  const { isAuthenticated, isCheckingAuth, logoutAndDisconnect } = useAuth();
  const { socketRef, gameId } = useGame();
  const [privateGameId, setPrivateGameId] = useState('');
  const [showPrivateGameInput, setShowPrivateGameInput] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !isCheckingAuth) {
      navigate('/login');
    }
  }, [isAuthenticated, isCheckingAuth, navigate]);

  useEffect(() => {
    if (gameId) {
      navigate('/game');
    }
  }, [gameId, navigate]);

  return (
    <div className={c.wrapper}>
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
          <div className={c.rel}>
            <Button onClick={() => setShowPrivateGameInput((prev) => !prev)}>
              Join private game
            </Button>
            {showPrivateGameInput && (
              <div className={c.inputWrapper}>
                <input
                  className={c.input}
                  placeholder='gameId'
                  value={privateGameId}
                  onChange={(e) => setPrivateGameId(e.target.value)}
                />
                <Button
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
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className={c.fixedRight}>
          <Button onClick={() => logoutAndDisconnect()}>Logout</Button>
          <br />
          <Button onClick={() => setShowInfo(true)}>Rules</Button>
        </div>{' '}
        <div className={clsx(c.infoContainer, { [c.open]: showInfo })}>
          <Button onClick={() => setShowInfo(false)}>Close</Button>
          <h2>Rules</h2>
          <ul>
            <li>
              Move: Click an adjacent hex to move your character before the
              timer runs out.
            </li>
            <li>
              Shoot: Click "Shoot" and select an adjacent hex to fire in that
              direction.
            </li>
            <li>
              Cards: Collect a card by moving onto it to gain one-time immunity
              from shots.
            </li>
            <li>
              Win: Collect 3 cards and go to the middle or just be the last one
              standing
            </li>
            <li>
              Collision: If both players move to the same hex, they bounce back
              to their previous positions, and the hex is marked as last known
              for both.
            </li>
            <li>
              Zone: Every 8 moves, the grid shrinks. Players outside the zone
              die.
            </li>
            <li>
              Visibility: Opponents are only visible at their last known
              position (when they shoot or collect a card).
            </li>
            <li>
              Turn: Shots resolve after all players make a move (shoot or move).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FindGamePage;
