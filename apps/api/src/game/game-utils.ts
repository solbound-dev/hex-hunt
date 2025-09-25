import { Game } from './Game';
import { DefaultEventsMap, Server } from 'socket.io';
import { Hex } from './Hex';

export const MAX_PLAYERS = 4;
export const START_GRID_RADIUS = 3;
export const MOVE_DURATION = 10;

export enum PlayerType {
  Astronaut = 'Astronaut',
  Alien = 'Alien',
  Robot = 'Robot',
  Wizard = 'Wizard',
}

export class Player {
  constructor(
    public playerType: PlayerType,
    public id: string,
    public pos: Hex,
    public lastSeenPos: Hex,
    public cards: number = 0,
    public pendingMove: Hex | null = null,
    public isDead: boolean = false,
    public justPickedCard: boolean = false,
    public isShooting: boolean | null = null,
    public isImmune: boolean = false,
    public didJustCollide: boolean = false,
    public didWin: boolean = false,
  ) {}
}

export function isNeighbor(hex: Hex, other: Hex) {
  return hex.neighbors().some((n) => n.equals(other));
}

//myb Game
export function updateAndEmitGameState(
  gameId: string,
  game: Game,
  websocketServer: Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
  >,
) {
  game.moves++;
  if (game.moves % 8 === 0 && game.currentRadius > 1) {
    game.currentRadius--;
    game.contractZone();
    const zoneAteCard = game.disappearedHexes.some((hex) =>
      hex.equals(game.cardPos!),
    );
    if (zoneAteCard) {
      game.spawnCard();
    }
  }

  game.players.forEach((p) => {
    const playerIsInForbiddenZone = game.disappearedHexes.some((h) => {
      h.equals(p.pos);
    });
    if (playerIsInForbiddenZone) {
      console.log(`${p.playerType} died`);
      p.isDead = true;
    }
  });

  game.players.forEach((p) => {
    if (p.cards === 3 && p.pos?.equals(new Hex(0, 0))) {
      game.players.forEach((op) => {
        if (op.id !== p.id) {
          op.isDead = true;
        }
      });
    }
  });

  websocketServer.to(gameId).emit('gameState', game);
  game.players.forEach((p) => {
    if (!p.justPickedCard) {
      p.isImmune = false;
    }
    p.pendingMove = null;
    p.isShooting = null;
    p.didJustCollide = false;
  });
}
