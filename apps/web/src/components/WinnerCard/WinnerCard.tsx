import c from './style.module.css';

type WinnerCardProps = {
  id: string;
  amount: number;
};

const WinnerCard: React.FC<WinnerCardProps> = ({ id, amount }) => {
  return (
    <div className={c.wrapper}>
      <h3>{id}</h3>
      <h4>{amount}$</h4>
    </div>
  );
};

export default WinnerCard;
