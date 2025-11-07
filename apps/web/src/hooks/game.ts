import { useEffect, useRef, useState } from 'react';
import { drawGridIsometric } from '../utils/draw-utils';
import { getContext, setCanvasRef, setImgRef } from '../utils/utils';
import {
  generateGrid,
  GRID_RADIUS,
  MOVE_ANIMATION_DURATION_IN_MS,
  MOVE_DURATION_IN_SECONDS,
} from '../utils/calculation-utils';
import { io, type Socket } from 'socket.io-client';
import type { DefaultEventsMap } from '@socket.io/component-emitter';
import toast from 'react-hot-toast';
import { useLocation } from 'wouter';
import { EventType } from '../components/AnimatedPopup/AnimatedPopup';
import type { GameData } from '../utils/GameData';
import { PlayerType } from '../utils/Player';
import type { Hex } from '../utils/Hex';

export type ImgRef = {
  astronaut: HTMLImageElement | null;
  alien: HTMLImageElement | null;
  robot: HTMLImageElement | null;
  wizard: HTMLImageElement | null;
  skull: HTMLImageElement | null;
  card: HTMLImageElement | null;
  bullet: HTMLImageElement | null;
};

export const useInitializeGame = (canvasSize: number, hexSize: number) => {
  const imgRef = useRef<ImgRef>({
    astronaut: null,
    alien: null,
    robot: null,
    wizard: null,
    skull: null,
    card: null,
    bullet: null,
  });

  setImgRef(imgRef, canvasSize);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setCanvasRef(canvasRef, canvasSize);
    const context = getContext(canvasRef);

    if (!context) return;
    drawGridIsometric(context, generateGrid(GRID_RADIUS), hexSize, canvasSize);
  }, [canvasSize, hexSize]);

  return {
    imgRef,
    canvasRef,
    canvasSize,
    hexSize,
  };
};

export const useInitializeSockets = (
  setGameState: (data: GameData | null) => void,
  setIsShooting: (isShooting: boolean) => void,
  setMadeMove: (madeMove: boolean) => void,
  setTimeRemaining: (time: number) => void,
  setAvailableGames: (games: string[]) => void,
  setGameId: (gameId: string) => void,
  setClickedHex: (hex: Hex | null) => void,
  setIsMovingAnimationActive: (isMovingAnimationActive: boolean) => void,
  setIsMovingAnimationFinished: (isMovingAnimationFinished: boolean) => void,
  setShowPopup: (showPopup: boolean) => void,
  setPopupEvents: (popupEvents: EventType[]) => void,
) => {
  const socketRef = useRef<Socket | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
    });

    socketRef.current.on('playerLeft', (data) => {
      toast.error('Player left', { position: 'bottom-left' });
      if (data) {
        setGameState(data);
      }
    });

    socketRef.current.on('availableGames', (data) => {
      setAvailableGames(data);
    });

    socketRef.current.on('gameFull', () => {
      console.log('This game already started');
      toast.error('Game unavailable');
    });

    socketRef.current.on('gameStart', (data) => {
      console.log('Game started! Data:', data);
      setGameState(data);
      setTimeRemaining(MOVE_DURATION_IN_SECONDS * 1000);
      setIsShooting(false);
      setMadeMove(false);
    });

    socketRef.current.on('alreadyHasRoom', () => {
      toast.error('You are already in another room', {
        position: 'bottom-left',
      });
    });

    socketRef.current.on('playerJoined', (data) => {
      console.log('Player joined:', data);
      toast.success('Joined!', { position: 'bottom-left' });
      setGameId(data.gameId);
      setGameState(data.game);
    });
    socketRef.current.on('gameState', (data: GameData) => {
      const events: EventType[] = [];

      if ((data.moves + 1) % 6 === 0) {
        toast.success('Zone contracting on next move!');
      }

      data.players.forEach((p) => {
        if (p.diedAtMove === data.moves - 1) {
          if (p.playerType === PlayerType.Astronaut)
            events.push(EventType.AstronautDied);
          if (p.playerType === PlayerType.Alien)
            events.push(EventType.AlienDied);
          if (p.playerType === PlayerType.Robot)
            events.push(EventType.RobotDied);
          if (p.playerType === PlayerType.Wizard)
            events.push(EventType.WizardDied);
        }
      });

      setShowPopup(true);
      setPopupEvents(events);
      setGameState(data);
      setIsShooting(false);
      setMadeMove(false);
      setClickedHex(null);
      setIsMovingAnimationActive(true);
      setIsMovingAnimationFinished(false);

      setTimeout(() => {
        setIsMovingAnimationActive(false);
      }, MOVE_ANIMATION_DURATION_IN_MS);
    });

    socketRef.current.on('reconnect', (data) => {
      console.log('now', new Date().toISOString());
      setGameId(data.gameId);
      setGameState(data.game);
    });
  }, [
    setGameState,
    setIsShooting,
    setMadeMove,
    setTimeRemaining,
    setAvailableGames,
    setGameId,
    setClickedHex,
    navigate,
    setIsMovingAnimationActive,
    setIsMovingAnimationFinished,
    setShowPopup,
    setPopupEvents,
  ]);

  return socketRef;
};

export const useTimer = (
  gameState: GameData | undefined,
  socketRef: React.RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>,
  madeMove: boolean,
  gameId: string,
  timeRemaining: number,
  setTimeRemaining: (time: number) => void,
  walletId?: string,
) => {
  const [eventDate, setEventDate] = useState('');
  const [countdownStarted, setCountdownStarted] = useState(false);

  //reset timer
  useEffect(() => {
    const playerIsDead = gameState?.players.some(
      (p) => p.walletId === walletId && p.isDead,
    );

    if (playerIsDead) {
      return;
    }

    setEventDate(
      new Date(
        new Date().getTime() + MOVE_DURATION_IN_SECONDS * 1000,
      ).toISOString(),
    );
    if (gameState?.started) {
      setCountdownStarted(true);
    }
  }, [gameState, socketRef, walletId]);

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
    setTimeRemaining,
  ]);

  return { timeRemaining, setTimeRemaining };
};
