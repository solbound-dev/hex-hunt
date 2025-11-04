import { Hex } from './Hex';

export const MAX_PLAYERS = 4;
export const START_GRID_RADIUS = 3;
export const MOVE_DURATION_IN_SECONDS = 20;

export function isNeighbor(hex: Hex, other: Hex) {
  return hex.neighbors().some((n) => n.equals(other));
}
