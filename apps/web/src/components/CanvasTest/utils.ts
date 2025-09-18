import astronautSrc from '../../assets/astronaut.png';
import alienSrc from '../../assets/alien.png';
import cardSrc from '../../assets/card.png';
import skullSrc from '../../assets/skull.png';

import { CANVAS_SIZE, Hex } from './calculation-utils';

export function getPlayerType(
  socketId: string | null | undefined,
  astronautId: string | null | undefined,
  alienId: string | null | undefined,
) {
  if (!socketId || !astronautId || !alienId) return '';
  if (socketId === astronautId) return 'Astronaut';
  else if (socketId === alienId) return 'Alien';
  else return '';
}

export function setAstronautImage(
  astronautImgRef: React.RefObject<HTMLImageElement | null>,
) {
  const astronaut = new Image();
  astronaut.src = astronautSrc;
  astronaut.width = 160;
  astronaut.height = 160;
  astronaut.onload = () => {
    astronautImgRef.current = astronaut;
  };
}

export function setAlienImage(
  alienImgRef: React.RefObject<HTMLImageElement | null>,
) {
  const alien = new Image();
  alien.src = alienSrc;
  alien.width = 50;
  alien.height = 50;
  alien.onload = () => {
    alienImgRef.current = alien;
  };
}

export function setCardImage(
  cardImgRef: React.RefObject<HTMLImageElement | null>,
) {
  const card = new Image();
  card.src = cardSrc;
  card.width = 37;
  card.height = 25;
  card.onload = () => {
    cardImgRef.current = card;
  };
}

export function setSkullImage(
  skullImageRef: React.RefObject<HTMLImageElement | null>,
) {
  const skull = new Image();
  skull.src = skullSrc;
  skull.width = 80;
  skull.height = 80;
  skull.onload = () => {
    skullImageRef.current = skull;
  };
}

export function setCanvasRef(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const canvas = canvasRef.current;
  canvas!.width = CANVAS_SIZE * 2;
  canvas!.height = CANVAS_SIZE * 2;
  canvas!.style.width = `${CANVAS_SIZE}px`;
  canvas!.style.height = `${CANVAS_SIZE}px`;
  return canvas;
}

export function setContextRef(
  context: CanvasRenderingContext2D | null,
  contextRef: React.RefObject<CanvasRenderingContext2D | null>,
) {
  context!.scale(2, 2);
  context!.strokeStyle = 'white';
  context!.lineWidth = 1;
  contextRef.current = context;
}

export function isNeighbor(clickedHex: Hex, currentPos: Hex | null) {
  if (!(currentPos instanceof Hex)) {
    currentPos = new Hex(currentPos!.q, currentPos!.r);
  }
  return currentPos?.neighbors().some((n) => n.equals(clickedHex))
    ? true
    : false;
}
