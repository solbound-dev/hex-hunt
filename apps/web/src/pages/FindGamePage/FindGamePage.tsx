import { useLocation } from 'wouter';
import { useAuth } from '../../providers/AuthProvider';
import { useGame } from '../../providers/GameProvider';
import { useEffect, useState } from 'react';
import c from './style.module.css';
import clsx from 'clsx';
import Modal from '../../components/Modal';
import ModalButton from '../../components/Modal/ModalButton';
import ClockIcon from '../../assets/clock.svg';
import UsersCrownIcon from '../../assets/users-crown.svg';
import LockIcon from '../../assets/lock.svg';
import Logo from '../../assets/logo-hex.svg';
import Carousel from '../../components/Carousel';

import tutorialMove from '../../assets/tutorial/tutorial_move.png';
import tutorialShoot from '../../assets/tutorial/tutorial_shoot.png';
import tutorialStardust from '../../assets/tutorial/tutorial_stardust.png';
import tutorialTurn from '../../assets/tutorial/tutorial_turn.png';
import tutorialVisibility from '../../assets/tutorial/tutorial_visibility.png';
import tutorialWin from '../../assets/tutorial/tutorial_win.png';
import tutorialZone from '../../assets/tutorial/tutorial_zone.png';
import tutorialCollision from '../../assets/tutorial/tutorial_collision.png';

import type { EmblaOptionsType } from 'embla-carousel';

const OPTIONS: EmblaOptionsType = { containScroll: false };

const SLIDES = [
  {
    title: 'Move',
    text: 'Click an adjacent hex to move your character before the timer runs out.',
    img: tutorialMove,
  },
  {
    title: 'Stardust',
    text: 'Collect stardust by moving onto it to gain one-time immunity from shots.',
    img: tutorialStardust,
  },
  {
    title: 'Shoot',
    text: 'Click "Shoot" and select an adjacent hex to fire in that direction. Shooting stardust moves it to a new location.',
    img: tutorialShoot,
  },
  {
    title: 'Win',
    text: 'Collect 3 stardust and go to the middle or just be the last one standing.',
    img: tutorialWin,
  },
  {
    title: 'Collision',
    text: 'If two players move to the same hex, they bounce back to their previous positions, and the hex is marked as last known for both.',
    img: tutorialCollision,
  },
  {
    title: 'Zone',
    text: 'Every 8 moves, the grid shrinks. Players outside the zone die.',
    img: tutorialZone,
  },
  {
    title: 'Visibility',
    text: 'Opponents are only visible at their last known position (when they shoot or collect stardust).',
    img: tutorialVisibility,
  },
  {
    title: 'Turn',
    text: 'Shots resolve after all players make a move (shoot or move) or the timer runs out.',
    img: tutorialTurn,
  },
];

const FindGamePage = () => {
  const { isAuthenticated, isCheckingAuth, logoutAndDisconnect } = useAuth();
  const { socketRef, gameId } = useGame();
  const [privateGameId, setPrivateGameId] = useState('');
  const [showInfo, setShowInfo] = useState(!localStorage.getItem('seenRules'));

  useEffect(() => {
    localStorage.setItem('seenRules', 'true');
  }, []);

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
      {/* <Modal isOpen={!showInfo} setIsOpen={() => {}}> */}
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
            <div className={c.inputWrapper}>
              <div className={c.flexAlignCenter}>
                <img className={c.mr8} src={LockIcon} alt='' />
                <input
                  className={c.input}
                  placeholder='Join private game'
                  value={privateGameId}
                  onChange={(e) => setPrivateGameId(e.target.value)}
                />
              </div>
              <button
                className={c.joinPrivateGameButton}
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
          </li>
        </ul>
      </Modal>

      <div style={{ pointerEvents: !showInfo ? 'none' : 'auto' }}>
        <Modal
          hasFullHeight={true}
          isOpen={showInfo}
          setIsOpen={() => setShowInfo(false)}>
          <Carousel slides={SLIDES} options={OPTIONS} />
        </Modal>
      </div>
      {/* <div
        className={clsx(c.infoContainer, { [c.open]: showInfo })}
        onClick={() => setShowInfo(false)}>
        <div className={c.rulesWrapper}>
          <img className={c.rulesPaper} src={RulesBackground} alt='' />
          <div className={clsx(c.infoInnerWrapper, { [c.open]: showInfo })}>
            <h2 className={clsx(c.rulesTitle)}>Rules</h2>
            <ul className={c.rulesTextWrapper}>
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
                one standing.
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
                Visib'ility: Opponents are only visible at their last known
                position (when they shoot or collect a card).
              </li>
              <li className={c.rulesText}>
                Turn: Shots resolve after all players make a move (shoot or
                move).
              </li>
            </ul>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default FindGamePage;
