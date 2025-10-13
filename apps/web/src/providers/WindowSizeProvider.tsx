import { useState, createContext, useContext, useEffect } from 'react';

interface WindowSizeState {
  width: number;
  height: number;
}

const initialContextValue = {
  width: 0,
  height: 0,
};

// eslint-disable-next-line react-refresh/only-export-components
export const WindowSizeContext =
  createContext<WindowSizeState>(initialContextValue);

interface Props {
  children: React.ReactNode;
}

const WindowSizeProvider: React.FC<Props> = ({ children }) => {
  const [windowSize, setWindowSize] =
    useState<WindowSizeState>(initialContextValue);

  const resizeHandler = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    document.documentElement.style.setProperty(
      '--viewport-height',
      `${window.innerHeight}px`,
    );
  };

  useEffect(() => {
    resizeHandler();

    window.addEventListener('resize', resizeHandler);

    return () => window.removeEventListener('resize', resizeHandler);
  }, []);

  return (
    <WindowSizeContext.Provider value={windowSize}>
      {children}
    </WindowSizeContext.Provider>
  );
};

export default WindowSizeProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useWindowSize = (): WindowSizeState =>
  useContext(WindowSizeContext);
