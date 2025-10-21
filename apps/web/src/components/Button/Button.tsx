import clsx from 'clsx';
import c from './style.module.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  disabled,
  className,
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={clsx(className, { [c.button]: !className })}>
      {children}
    </button>
  );
};

export default Button;
