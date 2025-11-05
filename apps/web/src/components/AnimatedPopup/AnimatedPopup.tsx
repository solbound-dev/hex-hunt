import { useEffect } from 'react';
import c from './style.module.css';
import astronautImg from '../../assets/astronaut2.png';
import alienImg from '../../assets/alien2.png';
import robotImg from '../../assets/robot2.png';
import wizardImg from '../../assets/wizard2.png';

// eslint-disable-next-line react-refresh/only-export-components
export enum EventType {
  AstronautDied = 'ASTRONAUT_DIED',
  AlienDied = 'ALIEN_DIED',
  RobotDied = 'ROBOT_DIED',
  WizardDied = 'WIZARD_DIED',
  ZoneContraction = 'ZONE_CONTRACTION',
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
    <div
      style={{ height: canvasSize * 0.8, width: canvasSize * 0.8 }}
      className={c.popup}>
      <div>
        {events.map((e) => {
          if (e === EventType.AstronautDied)
            return <img src={astronautImg} alt='' />;
          if (e === EventType.AlienDied)
            return (
              <img
                style={{ width: canvasSize * 0.4, height: canvasSize * 0.4 }}
                src={alienImg}
                alt=''
              />
            );
          if (e === EventType.RobotDied)
            return (
              <img
                style={{ width: canvasSize * 0.4, height: canvasSize * 0.4 }}
                src={robotImg}
                alt=''
              />
            );
          if (e === EventType.WizardDied)
            return (
              <img
                style={{ width: canvasSize * 0.4, height: canvasSize * 0.4 }}
                src={wizardImg}
                alt=''
              />
            );
        })}
      </div>
    </div>
  );
};

export default AnimatedPopup;
