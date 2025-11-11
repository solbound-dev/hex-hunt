import PlayerTag from './PlayerTag';
import type { GameData } from '../../utils/GameData';

type PlayerTagContainerProps = {
  gameState: GameData;
};

const PlayerTagContainer: React.FC<PlayerTagContainerProps> = ({
  gameState,
}) => {
  return (
    <div>
      {gameState?.players.map((p) => (
        <PlayerTag player={p} />
      ))}
    </div>
  );
};

export default PlayerTagContainer;
