import astronautSrc from '../assets/astronaut2.png';
import alienSrc from '../assets/alien2.png';
import robotSrc from '../assets/robot2.png';
import wizardSrc from '../assets/wizard2.png';
import cardSrc from '../assets/card2.png';
import skullSrc from '../assets/skull2.png';

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
  astronaut.width = (55 / 1000) * canvasSize;
  astronaut.height = (55 / 1000) * canvasSize;
  astronaut.onload = () => {
    imgRef.current.astronaut = astronaut;
  };

  const alien = new Image();
  alien.src = alienSrc;
  alien.width = (61 / 1000) * canvasSize;
  alien.height = (38 / 1000) * canvasSize;
  alien.onload = () => {
    imgRef.current.alien = alien;
  };

  const robot = new Image();
  robot.src = robotSrc;
  robot.width = (60 / 1000) * canvasSize;
  robot.height = (60 / 1000) * canvasSize;
  robot.onload = () => {
    imgRef.current.robot = robot;
  };

  const wizard = new Image();
  wizard.src = wizardSrc;
  wizard.width = (45 / 1000) * canvasSize;
  wizard.height = (45 / 1000) * canvasSize;
  wizard.onload = () => {
    imgRef.current.wizard = wizard;
  };

  const skull = new Image();
  skull.src = skullSrc;
  skull.width = (160 / 1000) * canvasSize;
  skull.height = (160 / 1000) * canvasSize;
  skull.onload = () => {
    imgRef.current.skull = skull;
  };

  const card = new Image();
  card.src = cardSrc;
  card.width = (43 / 1000) * canvasSize;
  card.height = (43 / 1000) * canvasSize;
  card.onload = () => {
    imgRef.current.card = card;
  };
}
