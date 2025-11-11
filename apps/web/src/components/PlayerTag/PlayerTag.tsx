import { Player, PlayerType } from '../../utils/Player';
import astronautImg from '../../assets/astronaut2.png';
import alienImg from '../../assets/alien2.png';
import robotImg from '../../assets/robot2.png';
import wizardImg from '../../assets/wizard2.png';
import c from './style.module.css';

type PlayerTagProps = {
  player: Player;
};

const PlayerTag: React.FC<PlayerTagProps> = ({ player }) => {
  let image = astronautImg;
  if (player.playerType === PlayerType.Alien) {
    image = alienImg;
  }
  if (player.playerType === PlayerType.Robot) {
    image = robotImg;
  }
  if (player.playerType === PlayerType.Wizard) {
    image = wizardImg;
  }
  return (
    <div className={c.tagWrapper}>
      <p className={c.text}>{player.playerType}</p>
      <div className={c.imageContainer}>
        <img className={c.image} src={image} alt='' />
      </div>
    </div>
  );
};

export default PlayerTag;
