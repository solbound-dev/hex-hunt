import { Game } from './Game';
import { DefaultEventsMap, Server } from 'socket.io';
import { Hex } from './Hex';

export const MAX_PLAYERS = 4;
export const START_GRID_RADIUS = 3;
export const MOVE_DURATION_IN_SECONDS = 5;

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
        if (op.walletId !== p.walletId) {
          op.isDead = true;
        }
      });
    }
  });

  const numberOfDeadPlayers = game.players.reduce(
    (prev, curr) => prev + (curr.isDead ? 1 : 0),
    0,
  );

  if (numberOfDeadPlayers === game.players.length - 1) {
    game.players.forEach((p) => {
      if (!p.isDead) {
        p.won = true;
        p.wins++;
      }
    });
  }

  websocketServer.to(gameId).emit('gameState', game);
  game.moveExpiryDate = new Date(
    new Date().getTime() + MOVE_DURATION_IN_SECONDS * 1000,
  ).toISOString();
  game.players.forEach((p) => {
    if (!p.justPickedCard) {
      p.isImmune = false;
    }
    p.pendingMove = null;
    p.isShooting = null;
    p.didJustCollide = false;
  });
}
