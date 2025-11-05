import { useEffect } from 'react';
import c from './style.module.css';
import PopupImage from './PopupImage';

// eslint-disable-next-line react-refresh/only-export-components
export enum EventType {
  AstronautDied = 'ASTRONAUT_DIED',
  AlienDied = 'ALIEN_DIED',
  RobotDied = 'ROBOT_DIED',
  WizardDied = 'WIZARD_DIED',
  ZoneContraction = 'ZONE_CONTRACTION',
  //TODO: AstronautWon, AlienWon, ...
}

type Props = {
  setShowPopup: (showPopup: boolean) => void;
  canvasSize: number;
  events: EventType[];
};

const AnimatedPopup: React.FC<Props> = ({
  setShowPopup,
  canvasSize,
  events,
}) => {
  useEffect(() => {
    setTimeout(() => {
      setShowPopup(false);
    }, 700);
  }, [setShowPopup]);

  return (
    <div className={c.popup}>
      {events.map((e) => (
        <PopupImage eventType={e} canvasSize={canvasSize} />
      ))}
    </div>
  );
};

export default AnimatedPopup;
