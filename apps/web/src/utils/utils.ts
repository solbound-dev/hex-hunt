import astronautSrc from '../assets/astronaut-hex.png';
import alienSrc from '../assets/alien-hex.png';
import robotSrc from '../assets/robot.png';
import wizardSrc from '../assets/wizard.png';
import cardSrc from '../assets/card.png';
import skullSrc from '../assets/skull.png';

import { Hex } from './calculation-utils';
import type { ImgRef } from '../hooks/game';

export function setCanvasRef(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  canvasSize: number,
) {
  const canvas = canvasRef.current;
  canvas!.width = canvasSize * 2;
  canvas!.height = (canvasSize * 2) / 1.7;
  canvas!.style.width = `${canvasSize}px`;
  canvas!.style.height = `${canvasSize / 1.7}px`;
  return canvas;
}

export function getContext(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const context = canvasRef.current?.getContext('2d');
  context!.scale(2, 2);
  context!.strokeStyle = 'white';
  context!.lineWidth = 1;
  return context;
}

export function isNeighbor(clickedHex: Hex, currentPos: Hex | null) {
  if (!(currentPos instanceof Hex)) {
    currentPos = new Hex(currentPos!.q, currentPos!.r);
  }
  return currentPos?.neighbors().some((n) => n.equals(clickedHex));
}

export function setImgRef(imgRef: React.RefObject<ImgRef>, canvasSize: number) {
  const astronaut = new Image();
  astronaut.src = astronautSrc;
  astronaut.width = (160 / 1000) * canvasSize;
  astronaut.height = (160 / 1000) * canvasSize;
  astronaut.onload = () => {
    imgRef.current.astronaut = astronaut;
  };

  const alien = new Image();
  alien.src = alienSrc;
  alien.width = (50 / 1000) * canvasSize;
  alien.height = (50 / 1000) * canvasSize;
  alien.onload = () => {
    imgRef.current.alien = alien;
  };

  const robot = new Image();
  robot.src = robotSrc;
  robot.width = (50 / 1000) * canvasSize;
  robot.height = (50 / 1000) * canvasSize;
  robot.onload = () => {
    imgRef.current.robot = robot;
  };

  const wizard = new Image();
  wizard.src = wizardSrc;
  wizard.width = (50 / 1000) * canvasSize;
  wizard.height = (50 / 1000) * canvasSize;
  wizard.onload = () => {
    imgRef.current.wizard = wizard;
  };

  const skull = new Image();
  skull.src = skullSrc;
  skull.width = (80 / 1000) * canvasSize;
  skull.height = (80 / 1000) * canvasSize;
  skull.onload = () => {
    imgRef.current.skull = skull;
  };

  const card = new Image();
  card.src = cardSrc;
  card.width = (37 / 1000) * canvasSize;
  card.height = (25 / 1000) * canvasSize;
  card.onload = () => {
    imgRef.current.card = card;
  };
}
