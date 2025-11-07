import { EventType } from './AnimatedPopup';
import astronautImg from '../../assets/astronaut2.png';
import alienImg from '../../assets/alien2.png';
import robotImg from '../../assets/robot2.png';
import wizardImg from '../../assets/wizard2.png';
import zoneWarningImg from '../../assets/zone-warning.png';
import c from './style.module.css';

function shouldShowCrossSign(eventType: EventType) {
  return (
    eventType === EventType.AstronautDied ||
    eventType === EventType.AlienDied ||
    eventType === EventType.RobotDied ||
    eventType === EventType.WizardDied
  );
}

type Props = {
  eventType: EventType;
  canvasSize: number;
};

const PopupImage: React.FC<Props> = ({ eventType, canvasSize }) => {
  let image = astronautImg;
  if (eventType === EventType.AlienDied) {
    image = alienImg;
  }
  if (eventType === EventType.RobotDied) {
    image = robotImg;
  }
  if (eventType === EventType.WizardDied) {
    image = wizardImg;
  }
  if (eventType === EventType.ZoneContraction) {
    image = zoneWarningImg;
  }

  return (
    <div
      style={{ height: canvasSize * 0.2, width: canvasSize * 0.2 }}
      className={c.imageWrapper}>
      {shouldShowCrossSign(eventType) && (
        <div className={c.crossSign}>
          <div className={c.crossBar}></div>
        </div>
      )}
      <img className={c.image} src={image} alt={eventType} />
    </div>
  );
};

export default PopupImage;
