import { createContext, useContext, useState } from 'react';
import { useInitializeSockets, useTimer } from '../hooks/game';
import {
  MOVE_DURATION_IN_SECONDS,
  type GameData,
  type Hex,
} from '../utils/calculation-utils';
import type { DefaultEventsMap } from '@socket.io/component-emitter';
import type { Socket } from 'socket.io-client';

interface GameContext {
  gameId: string;
  setGameId: (gameId: string) => void;
  gameState?: GameData | null;
  setGameState: (gameState: GameData | null) => void;
  isShooting: boolean;
  setIsShooting: (isShooting: boolean) => void;
  madeMove: boolean;
  setMadeMove: (madeMove: boolean) => void;
  isCanvasHovered: boolean;
  setIsCanvasHovered: (isCanvasHovered: boolean) => void;
  hoveredHex: Hex | null;
  setHoveredHex: (hoveredHex: Hex | null) => void;
  timeRemaining: number;
  setTimeRemaining: (timeRemaining: number) => void;
  availableGames: string[];
  setAvailableGames: (availableGames: string[]) => void;
  socketRef: React.RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>;
}

const initialContextValue = {
  gameId: '',
  setGameId: () => {},
  gameState: null,
  setGameState: () => {},
  isShooting: false,
  setIsShooting: () => {},
  madeMove: false,
  setMadeMove: () => {},
  isCanvasHovered: false,
  setIsCanvasHovered: () => {},
  hoveredHex: null,
  setHoveredHex: () => {},
  timeRemaining: MOVE_DURATION_IN_SECONDS * 1000,
  setTimeRemaining: () => {},
  availableGames: [],
  setAvailableGames: () => {},
  socketRef: { current: null },
};

// eslint-disable-next-line react-refresh/only-export-components
export const GameContext = createContext<GameContext>(initialContextValue);

type Props = {
  children: React.ReactNode;
};

const GameProvider: React.FC<Props> = ({ children }) => {
  const [gameId, setGameId] = useState('');
  const [gameState, setGameState] = useState<GameData | null>(null);
  const [isShooting, setIsShooting] = useState(false);
  const [madeMove, setMadeMove] = useState(false);
  const [isCanvasHovered, setIsCanvasHovered] = useState(false);
  const [hoveredHex, setHoveredHex] = useState<Hex | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(
    MOVE_DURATION_IN_SECONDS,
  );
  const [availableGames, setAvailableGames] = useState<string[]>([]);
  const [ranOutOfTime, setRanOutOfTime] = useState(false);
  // const { imgRef, canvasRef } = useInitializeGame();

  const socketRef = useInitializeSockets(
    setGameState,
    setIsShooting,
    setMadeMove,
    setTimeRemaining,
    setRanOutOfTime,
    setAvailableGames,
    setGameId,
  );
  useTimer(
    gameState!,
    socketRef,
    madeMove,
    gameId,
    timeRemaining,
    setTimeRemaining,
    ranOutOfTime,
    setRanOutOfTime,
  );

  const value = {
    gameId,
    setGameId,
    gameState,
    setGameState,
    isShooting,
    setIsShooting,
    madeMove,
    setMadeMove,
    isCanvasHovered,
    setIsCanvasHovered,
    hoveredHex,
    setHoveredHex,
    timeRemaining,
    setTimeRemaining,
    availableGames,
    setAvailableGames,
    socketRef,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => useContext(GameContext);
