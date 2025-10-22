import clsx from 'clsx';
import c from './style.module.css';
import CountUp from 'react-countup';

const Loading = () => {
  return (
    <div className={c.wrapper}>
      <div className={clsx(c.hexagon, c.loadingText)}>
        <CountUp className={c.loadingText} duration={1.5} end={100} /> %
      </div>
    </div>
  );
};

export default Loading;
