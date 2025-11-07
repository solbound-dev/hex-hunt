import type { GameData } from './GameData';
import { Hex } from './Hex';

export const PI = 3.14159;
export const GRID_RADIUS = 3;
export const MOVE_DURATION_IN_SECONDS = 15;
export const MOVE_ANIMATION_DURATION_IN_MS = 600;

export function generateGrid(currentRadius: number) {
  const grid: Hex[] = [];
  for (let q = -currentRadius; q <= currentRadius; q++) {
    const r1 = Math.max(-currentRadius, -q - currentRadius);
    const r2 = Math.min(currentRadius, -q + currentRadius);
    for (let r = r1; r <= r2; r++) {
      const hex = new Hex(q, r);
      grid.push(hex);
    }
  }
  return grid;
}

function roundHex(frac: Hex) {
  let q = Math.round(frac.q);
  let r = Math.round(frac.r);
  let s = Math.round(frac.s);
  const dq = Math.abs(q - frac.q);
  const dr = Math.abs(r - frac.r);
  const ds = Math.abs(s - frac.s);
  if (dq > dr && dq > ds) q = -r - s;
  else if (dr > ds) r = -q - s;
  else s = -q - r;
  return new Hex(q, r);
}

export function pixelToHex(
  x: number,
  y: number,
  canvasSize: number,
  hexSize: number,
) {
  x = (x - canvasSize / 2) / hexSize;
  y = (y - canvasSize / 2) / hexSize;
  const q = (Math.sqrt(3) / 3) * x - (1 / 3) * y;
  const r = (2 / 3) * y;
  return roundHex(new Hex(q, r));
}

export function hexToPixel(hex: Hex, canvasSize: number, hexSize: number) {
  const x = hexSize * Math.sqrt(3) * (hex.q + hex.r / 2);
  const y = ((hexSize * 3) / 2) * hex.r;
  return { x: x + canvasSize / 2, y: y + canvasSize / 2 };
}

export function isInGrid(hex: Hex, grid: Hex[], disappearedHexes: Hex[]) {
  return (
    grid.some((h) => h.q === hex.q && h.r === hex.r) &&
    !disappearedHexes.some((h) => h.q === hex.q && h.r === hex.r)
  );
}

export function isSameMove(move: Hex, pos: Hex | null) {
  if (move.q === pos?.q && move.r === pos?.r) {
    return true;
  }
  return false;
}

export function inverseIsometricTransformation(
  ox: number,
  oy: number,
  hexSize: number,
) {
  const x = 0.5 * ((ox - 6.1 * hexSize) / 0.7 + (oy + 0.6 * hexSize) / 0.35);
  const y = 0.5 * ((oy + 0.6 * hexSize) / 0.35 - (ox - 6.1 * hexSize) / 0.7);

  return { x, y };
}

export function getMousePosition(
  event: MouseEvent | React.MouseEvent<HTMLCanvasElement>,
  rect: DOMRect,
  hexSize: number,
) {
  const ox = event.clientX - rect.left;
  const oy = event.clientY - rect.top;
  const coordinates = inverseIsometricTransformation(ox, oy, hexSize);
  return coordinates;
}

export function getNearestHex(
  gameState: GameData,
  x: number,
  y: number,
  canvasSize: number,
  hexSize: number,
) {
  let nearest: Hex | null = null;
  let minDist = Infinity;

  for (const h of gameState.grid) {
    const center = hexToPixel(h, canvasSize, hexSize);
    const dx = center.x - x;
    const dy = center.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist && dist < hexSize) {
      nearest = h;
      minDist = dist;
    }
  }
  return nearest;
}
export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function easeOutSine(t: number): number {
  return Math.sin((t * Math.PI) / 2);
}

export function applyIsometricTransformation(
  x: number,
  y: number,
  hexSize: number,
) {
  return {
    ox: x * 0.7 - y * 0.7 + 6.1 * hexSize,
    oy: 0.5 * x * 0.7 + 0.5 * y * 0.7 - 0.6 * hexSize,
  };
}
