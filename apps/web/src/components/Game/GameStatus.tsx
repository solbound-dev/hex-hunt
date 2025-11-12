import c from './style.module.css';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../Button';
import { useGame } from '../../providers/GameProvider';
import { useLocation } from 'wouter';
import DarkContainer from '../DarkContainer';
import PlayerTagContainer from '../PlayerTag';
import ProgressBarTimer from '../ProgressBarTimer';

export const GameStatus = () => {
  const queryClient = useQueryClient();

  const {
    gameState,
    gameId,
    setGameId,
    setGameState,
    setClickedHex,
    timeRemaining,
    madeMove,
    socketRef,
  } = useGame();

  const [, navigate] = useLocation();

  const gameContainsWinner = gameState?.players.some((p) => p.won);

  let numberOfPlayers = 0;
  if (gameState?.players) {
    numberOfPlayers = gameState.players.length;
  }

  return (
    <div className={c.statusWrapper}>
      {gameState?.started && !gameState.draw && !gameContainsWinner && (
        <ProgressBarTimer timeRemaining={timeRemaining} />
      )}
      {!gameState?.started && (
        <DarkContainer className={c.fixedTop}>
          <span className={c.fs12}>Waiting for players...</span>
        </DarkContainer>
      )}
      <DarkContainer>
        <div className={c.flex}>
          {gameState?.started && !gameState.draw && !gameContainsWinner && (
            <div
              className={c.madeMoveIndicator}
              style={{
                backgroundColor: madeMove ? 'lightgreen' : 'grey',
              }}
            />
          )}
        </div>
        <div>Game code: {gameId}</div>
        {!gameState?.started && numberOfPlayers >= 2 && (
          <Button
            className={c.startGameButton}
            onClick={() => {
              socketRef.current?.emit('start', { gameId: gameId });
              queryClient.invalidateQueries({ queryKey: ['games'] });
            }}>
            Start game
          </Button>
        )}
        {
          <Button
            onClick={() => {
              socketRef.current?.emit('leaveGame', { gameId });
              setGameId('');
              setGameState(null);
              setClickedHex(null);
              navigate('/');
            }}
            className={c.leaveButton}>
            Leave
          </Button>
        }
      </DarkContainer>
      <PlayerTagContainer gameState={gameState} />
    </div>
  );
};
