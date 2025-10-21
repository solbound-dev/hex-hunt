import { useLocation } from 'wouter';
import { useAuth } from '../../providers/AuthProvider';
import { useGame } from '../../providers/GameProvider';
import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import c from './style.module.css';
import clsx from 'clsx';
import Modal from '../../components/Modal';
import ModalButton from '../../components/Modal/ModalButton';
import ClockIcon from '../../assets/clock.svg';
import UsersCrownIcon from '../../assets/users-crown.svg';
import LockIcon from '../../assets/lock.svg';
import Logo from '../../assets/logo-hex.svg';
import RulesBackground from '../../assets/rules-paper.png';

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
    <div className={c.pageWrapper}>
      <div className={c.navigation}>
        <div className={c.flex}>
          <img className={c.logo} src={Logo} alt='logo' />
          <p className={c.navigationText}>hextraction</p>
        </div>
        <div>
          <button
            className={clsx(c.rulesButton, { [c.active]: showInfo })}
            onClick={() => setShowInfo((prev) => !prev)}>
            Rules
          </button>
          <button
            className={c.logoutButton}
            onClick={() => logoutAndDisconnect()}>
            Logout
          </button>
        </div>
      </div>
      <Modal isOpen={!showInfo} setIsOpen={() => {}}>
        <ul className={c.ul}>
          <li className={c.li}>
            <ModalButton
              handleClick={() => {
                socketRef.current?.disconnect();
                socketRef.current?.connect();
                socketRef.current?.emit('quickJoin', { tier: 1 });
                navigate('/game');
              }}
              icon={ClockIcon}
              iconSize={20}
              name='Quick match'></ModalButton>
          </li>
          <li className={c.li}>
            <ModalButton
              handleClick={() => {
                socketRef.current?.disconnect();
                socketRef.current?.connect();
                socketRef.current?.emit('hostPrivateGame', { tier: 1 });
                navigate('/game');
              }}
              icon={UsersCrownIcon}
              iconSize={20}
              name='Host private game'></ModalButton>
          </li>
          <li className={c.li}>
            <ModalButton
              icon={LockIcon}
              iconSize={20}
              name='Join private game'></ModalButton>
          </li>
        </ul>
      </Modal>
      {/* <div className={c.buttonGroup}>
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
          </div> */}
      {/* </div> */}
      {/* <div className={c.fixedRight}>
        <Button onClick={() => logoutAndDisconnect()}>Logout</Button>
        <br />
        <Button onClick={() => setShowInfo(true)}>Rules</Button>
      </div>{' '} */}

      <div
        className={clsx(c.infoContainer, { [c.open]: showInfo })}
        onClick={() => setShowInfo(false)}>
        <div className={c.rulesWrapper}>
          <img className={c.rulesPaper} src={RulesBackground} alt='' />
          <div className={c.infoInnerWrapper}>
            <h2 className={c.rulesTitle}>Rules</h2>
            <ul>
              <li className={c.rulesText}>
                Move: Click an adjacent hex to move your character before the
                timer runs out.
              </li>
              <li className={c.rulesText}>
                Shoot: Click "Shoot" and select an adjacent hex to fire in that
                direction.
              </li>
              <li className={c.rulesText}>
                Cards: Collect a card by moving onto it to gain one-time
                immunity from shots.
              </li>
              <li className={c.rulesText}>
                Win: Collect 3 cards and go to the middle or just be the last
                one standing
              </li>
              <li className={c.rulesText}>
                Collision: If both players move to the same hex, they bounce
                back to their previous positions, and the hex is marked as last
                known for both.
              </li>
              <li className={c.rulesText}>
                Zone: Every 8 moves, the grid shrinks. Players outside the zone
                die.
              </li>
              <li className={c.rulesText}>
                Visibility: Opponents are only visible at their last known
                position (when they shoot or collect a card).
              </li>
              <li className={c.rulesText}>
                Turn: Shots resolve after all players make a move (shoot or
                move).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindGamePage;
