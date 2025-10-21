import astronautSrc from '../assets/astronaut-hex.png';
import alienSrc from '../assets/alien-hex.png';
import robotSrc from '../assets/robot.png';
import wizardSrc from '../assets/wizard.png';
import cardSrc from '../assets/card.png';
import skullSrc from '../assets/skull.png';

import { CANVAS_SIZE, Hex } from './calculation-utils';
import type { ImgRef } from '../hooks/game';

export function setBackgroundImage(
  backgroundImgRef: React.RefObject<HTMLImageElement | null>,
) {
  const background = new Image();
  background.src = backgroundRef;
  background.width = CANVAS_SIZE;
  background.height = CANVAS_SIZE;
  background.onload = () => {
    backgroundImgRef.current = background;
  };
}

export function setCanvasRef(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const canvas = canvasRef.current;
  canvas!.width = CANVAS_SIZE * 2;
  canvas!.height = (CANVAS_SIZE * 2) / 1.7;
  canvas!.style.width = `${CANVAS_SIZE}px`;
  canvas!.style.height = `${CANVAS_SIZE / 1.7}px`;
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

export function setImgRef(imgRef: React.RefObject<ImgRef>) {
  const astronaut = new Image();
  astronaut.src = astronautSrc;
  astronaut.width = (160 / 1000) * CANVAS_SIZE;
  astronaut.height = (160 / 1000) * CANVAS_SIZE;
  astronaut.onload = () => {
    imgRef.current.astronaut = astronaut;
  };

  const alien = new Image();
  alien.src = alienSrc;
  alien.width = (50 / 1000) * CANVAS_SIZE;
  alien.height = (50 / 1000) * CANVAS_SIZE;
  alien.onload = () => {
    imgRef.current.alien = alien;
  };

  const robot = new Image();
  robot.src = robotSrc;
  robot.width = (50 / 1000) * CANVAS_SIZE;
  robot.height = (50 / 1000) * CANVAS_SIZE;
  robot.onload = () => {
    imgRef.current.robot = robot;
  };

  const wizard = new Image();
  wizard.src = wizardSrc;
  wizard.width = (50 / 1000) * CANVAS_SIZE;
  wizard.height = (50 / 1000) * CANVAS_SIZE;
  wizard.onload = () => {
    imgRef.current.wizard = wizard;
  };

  const skull = new Image();
  skull.src = skullSrc;
  skull.width = (80 / 1000) * CANVAS_SIZE;
  skull.height = (80 / 1000) * CANVAS_SIZE;
  skull.onload = () => {
    imgRef.current.skull = skull;
  };

  const card = new Image();
  card.src = cardSrc;
  card.width = (37 / 1000) * CANVAS_SIZE;
  card.height = (25 / 1000) * CANVAS_SIZE;
  card.onload = () => {
    imgRef.current.card = card;
  };
}
