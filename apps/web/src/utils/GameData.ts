import type { Hex } from './Hex';
import type { Player } from './Player';

export type GameData = {
  grid: Hex[];
  disappearedHexes: Hex[];
  warningHexes: Hex[];
  moves: number;
  cardPos: Hex | null;
  previousCardPos: Hex | null;
  currentRadius: number;
  started: boolean;
  won: boolean;
  draw: boolean;
  //this should not get sent to both players:
  players: Player[];
};
