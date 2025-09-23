import { useEffect, useRef, useState } from 'react';
import { drawGridIsometric } from './draw-utils';
import {
  setAlienImage,
  setAstronautImage,
  setCanvasRef,
  setCardImage,
  setContextRef,
  setRobotImage,
  setSkullImage,
  setWizardImage,
} from './utils';
import {
  generateGrid,
  GRID_RADIUS,
  MOVE_DURATION,
  type GameData,
} from './calculation-utils';
import { io, type Socket } from 'socket.io-client';
import type { DefaultEventsMap } from '@socket.io/component-emitter';

export const useInitializeGame = () => {
  // const backgroundImgRef = useRef<HTMLImageElement | null>(null);
  const astronautImgRef = useRef<HTMLImageElement | null>(null);
  const alienImgRef = useRef<HTMLImageElement | null>(null);
  const robotImgRef = useRef<HTMLImageElement | null>(null);
  const wizardImgRef = useRef<HTMLImageElement | null>(null);
  const cardImgRef = useRef<HTMLImageElement | null>(null);
  const skullImgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D>(null);

  useEffect(() => {
    setAstronautImage(astronautImgRef);
    setAlienImage(alienImgRef);
    setRobotImage(robotImgRef);
    setWizardImage(wizardImgRef);
    setCardImage(cardImgRef);
    setSkullImage(skullImgRef);
    // setBackgroundImage(backgroundImgRef);
    const canvas = setCanvasRef(canvasRef);
    const context = canvas!.getContext('2d');
    setContextRef(context, contextRef);
    drawGridIsometric(contextRef.current!, generateGrid(GRID_RADIUS));
  }, []);

  return {
    astronautImgRef,
    alienImgRef,
    robotImgRef,
    wizardImgRef,
    cardImgRef,
    skullImgRef,
    canvasRef,
    contextRef,
  };
};

export const useInitializeSockets = (
  setGameState: (data: GameData) => void,
  setIsShooting: (isShooting: boolean) => void,
  setMadeMove: (madeMove: boolean) => void,
) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
    });
    socketRef.current.on('gameFull', () =>
      console.log('This game already started'),
    );

    socketRef.current.on('gameStart', (data) => {
      console.log('Game started! Data:', socketRef.current?.id, data);
      setGameState(data);
    });

    socketRef.current.on('playerJoined', (data) =>
      console.log('Player joined:', data),
    );
    socketRef.current.on('gameState', (data) => {
      setGameState(data);
      setIsShooting(false);
      setMadeMove(false);
    });
  }, [setGameState, setIsShooting, setMadeMove]);

  return socketRef;
};

export const useTimer = (
  gameState: GameData | undefined,
  socketRef: React.RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>,
  madeMove: boolean,
  gameId: string,
  //   setRanOutOfTime: (ranOutOfTime: boolean) => void,
) => {
  const [eventDate, setEventDate] = useState('');
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(MOVE_DURATION);
  const [ranOutOfTime, setRanOutOfTime] = useState(false);

  //reset timer
  useEffect(() => {
    const playerIsDead = gameState?.players.some(
      (p) => p.id === socketRef.current?.id && p.isDead,
    );

    if (playerIsDead) {
      return;
    }

    setEventDate(
      new Date(new Date().getTime() + MOVE_DURATION * 1000).toISOString(),
    );
    if (gameState) {
      setCountdownStarted(true);
    }
  }, [gameState, socketRef]);

  //timer logic
  useEffect(() => {
    if (countdownStarted && eventDate) {
      const countdownInterval = setInterval(() => {
        const currentTime = new Date().getTime();
        const eventTime = new Date(eventDate).getTime();
        let remainingTime = eventTime - currentTime;
        if (remainingTime <= 0) {
          remainingTime = 0;
          clearInterval(countdownInterval);
          setCountdownStarted(false);
          if (!madeMove) {
            setRanOutOfTime(true);
          }
        }
        setTimeRemaining(remainingTime);
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [
    countdownStarted,
    eventDate,
    timeRemaining,
    gameId,
    madeMove,
    setRanOutOfTime,
  ]);

  //ran out of time
  useEffect(() => {
    const playerIsDead = gameState?.players.some(
      (p) => p.id === socketRef.current?.id && p.isDead,
    );
    if (ranOutOfTime && !madeMove && !playerIsDead) {
      socketRef.current?.emit('updateGame', {
        gameId,
        move: null,
        isShooting: false,
        didRunOutOfTime: true,
      });
    }
  }, [ranOutOfTime, gameId, madeMove, gameState?.players, socketRef]);

  return timeRemaining;
};
