import PlayerTag from './PlayerTag';
import type { GameData } from '../../utils/GameData';
import c from './style.module.css';

type PlayerTagContainerProps = {
  gameState: GameData | null | undefined;
};

const PlayerTagContainer: React.FC<PlayerTagContainerProps> = ({
  gameState,
}) => {
  return (
    <div className={c.container}>
      {gameState?.players.map((p) => (
        <PlayerTag key={p.walletId} player={p} />
      ))}
    </div>
  );
};

export default PlayerTagContainer;
