import clsx from 'clsx';
import c from './style.module.css';
import type { ReactNode } from 'react';

interface Props {
  className?: string;
  children?: ReactNode;
}

const DarkContainer: React.FC<Props> = ({ className, children }) => {
  return <div className={clsx(c.darkContainer, className)}>{children}</div>;
};

export default DarkContainer;
