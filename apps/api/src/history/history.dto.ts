import { PlayerType } from '@prisma/client';
import { Hex } from 'src/game/Hex';

export class HistoryPlayer {
  playerId: string;
  playerType: PlayerType;
  initialPos: Hex;
}

export class HistoryGame {
  id: number;
  gameCode: string;
  createdAt: Date;
}
