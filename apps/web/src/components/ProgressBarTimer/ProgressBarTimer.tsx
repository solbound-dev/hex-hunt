import { MOVE_DURATION_IN_SECONDS } from '../../utils/calculation-utils';
import c from './style.module.css';

type Props = {
  timeRemaining: number;
};

const ProgressBarTimer: React.FC<Props> = ({ timeRemaining }) => {
  return (
    <div className={c.wrapper}>
      <div
        style={{
          width: `${timeRemaining / ((MOVE_DURATION_IN_SECONDS * 1000) / 100)}%`,
        }}
        className={c.bar}></div>
    </div>
  );
};

export default ProgressBarTimer;
