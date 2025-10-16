import c from './style.module.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = ({ onClick, children, disabled }) => {
  return (
    <button disabled={disabled} onClick={onClick} className={c.button}>
      {children}
    </button>
  );
};

export default Button;
