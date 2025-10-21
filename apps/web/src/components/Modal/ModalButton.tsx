import Button from '../Button';
import c from './style.module.css';
import type { MouseEvent } from 'react';

interface Props {
  handleClick?: (event: MouseEvent<HTMLElement>) => void;
  iconSize?: number;
  icon?: string;
  name?: string;
}

const ModalButton: React.FC<Props> = ({
  handleClick,
  iconSize,
  icon,
  name,
}) => {
  return (
    <Button className={c.modalButton} onClick={handleClick}>
      <img
        style={{ height: iconSize, width: iconSize }}
        className={c.walletIcon}
        src={icon}
        alt={name}
      />
      <p className={c.walletName}>{name}</p>
    </Button>
  );
};

export default ModalButton;
