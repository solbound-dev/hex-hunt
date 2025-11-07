import { createContext, useContext, useState } from 'react';
import { useInitializeSockets, useTimer } from '../hooks/game';
import { MOVE_DURATION_IN_SECONDS } from '../utils/calculation-utils';
import type { DefaultEventsMap } from '@socket.io/component-emitter';
import type { Socket } from 'socket.io-client';
import useScreenSize from '../hooks/useScreenSize';
import type { EventType } from '../components/AnimatedPopup/AnimatedPopup';
import type { GameData } from '../utils/GameData';
import type { Hex } from '../utils/Hex';

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
  clickedHex: Hex | null;
  setClickedHex: (hoveredHex: Hex | null) => void;
  timeRemaining: number;
  setTimeRemaining: (timeRemaining: number) => void;
  availableGames: string[];
  setAvailableGames: (availableGames: string[]) => void;
  socketRef: React.RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>;
  canvasSize: number;
  hexSize: number;
  isMovingAnimationActive: boolean;
  setIsMovingAnimationActive: (isMovingAnimationActive: boolean) => void;
  isMovingAnimationFinished: boolean;
  setIsMovingAnimationFinished: (isMovingAnimationFinished: boolean) => void;
  showPopup: boolean;
  setShowPopup: (showPopup: boolean) => void;
  popupEvents: EventType[];
  setPopupEvents: (popupEvents: EventType[]) => void;
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
  clickedHex: null,
  setClickedHex: () => {},
  timeRemaining: MOVE_DURATION_IN_SECONDS * 1000,
  setTimeRemaining: () => {},
  availableGames: [],
  setAvailableGames: () => {},
  socketRef: { current: null },
  canvasSize: 0,
  hexSize: 0,
  isMovingAnimationActive: false,
  setIsMovingAnimationActive: () => {},
  isMovingAnimationFinished: true,
  setIsMovingAnimationFinished: () => {},
  showPopup: false,
  setShowPopup: () => {},
  popupEvents: [],
  setPopupEvents: () => {},
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
  const [clickedHex, setClickedHex] = useState<Hex | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(
    MOVE_DURATION_IN_SECONDS,
  );
  const [availableGames, setAvailableGames] = useState<string[]>([]);
  const [isMovingAnimationActive, setIsMovingAnimationActive] = useState(false);
  const [isMovingAnimationFinished, setIsMovingAnimationFinished] =
    useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [popupEvents, setPopupEvents] = useState<EventType[]>([]);

  const size = useScreenSize();
  const canvasSize =
    size.height / size.width > 2160 / 3840 ? size.height / 1.1 : size.width / 2;
  const hexSize = (canvasSize / 70) * 5.8;

  const socketRef = useInitializeSockets(
    setGameState,
    setIsShooting,
    setMadeMove,
    setTimeRemaining,
    setAvailableGames,
    setGameId,
    setClickedHex,
    setIsMovingAnimationActive,
    setIsMovingAnimationFinished,
    setShowPopup,
    setPopupEvents,
  );
  useTimer(
    gameState!,
    socketRef,
    madeMove,
    gameId,
    timeRemaining,
    setTimeRemaining,
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
    clickedHex,
    setClickedHex,
    canvasSize,
    hexSize,
    isMovingAnimationActive,
    setIsMovingAnimationActive,
    showPopup,
    setShowPopup,
    popupEvents,
    setPopupEvents,
    isMovingAnimationFinished,
    setIsMovingAnimationFinished,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => useContext(GameContext);
