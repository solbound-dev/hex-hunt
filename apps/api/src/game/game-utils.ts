import { Hex } from './Hex';
import { DefaultEventsMap, Server } from 'socket.io';

export type GameData = {
  grid: Hex[];
  disappearedHexes: Hex[];
  warningHexes: Hex[];
  moves: number;
  cardPos: Hex | null;
  currentRadius: number;
  //this should not get sent to both players:
  players: Player[]; //we currently send position of every player to every player
};

export enum PlayerType {
  Astronaut = 'Astronaut',
  Alien = 'Alien',
  Robot = 'Robot',
  Wizard = 'Wizard',
}

export class Player {
  constructor(
    public playerType: PlayerType,
    public id: string | null = null,
    public lastSeenPos: Hex | null = null,
    public cards: number = 0,
    public pendingMove: Hex | null = null,
    public isDead: boolean = false,
    public justPickedCard: boolean = false,
    public pos: Hex | null = null,
    public isShooting: boolean | null = null,
    public isImmune: boolean = false,
    public didJustCollide: boolean = false,
  ) {}
}

export function getAvailablePlayerPos(players: Player[], grid: Hex[]) {
  let pos: Hex;
  while (true) {
    const randomIndex = Math.floor(Math.random() * grid.length);
    pos = grid[randomIndex];
    if (!players.some((p) => p.pos?.equals(pos))) {
      break;
    }
  }
  return pos;
}

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

export function isSameMove(move: Hex, pos: Hex | null) {
  const moveInstance = new Hex(move.q, move.r);
  return moveInstance.equals(pos!);
}

export function isInGrid(hex: Hex, grid: Hex[], disappearedHexes: Hex[]) {
  const hexInstance = new Hex(hex.q, hex.r);
  return (
    grid.some((h) => h.equals(hexInstance)) &&
    !disappearedHexes.some((h) => h.equals(hexInstance))
  );
}

export function isNeighbor(clickedHex: Hex, currentPos: Hex | null) {
  if (!(currentPos instanceof Hex)) {
    currentPos = new Hex(currentPos!.q, currentPos!.r);
  }
  return currentPos?.neighbors().some((n) => n.equals(clickedHex))
    ? true
    : false;
}

export function spawnCard(game: GameData) {
  if (!game.grid || game.grid.length === 0) return null;

  const possibleHexes = game.grid.filter((h) => {
    const hexIsTaken = game.players.some((p) => p.pos?.equals(h));
    const hexDisappeared = game.disappearedHexes.some((d) => d.equals(h));

    return (
      !hexIsTaken &&
      !hexDisappeared &&
      (!game.cardPos! || !h.equals(game.cardPos))
    );
  });

  const cardPos =
    possibleHexes[Math.floor(Math.random() * possibleHexes.length)];

  return cardPos;
}

export function shootInDirection(
  directionHex: Hex,
  game: GameData,
  shooter: Player,
) {
  game.players.forEach((p) => {
    if (p.id === shooter.id) {
      return;
    }
    let targetPos: Hex;
    if (p.isShooting) {
      targetPos = p.pos!;
    } else {
      targetPos = p.pendingMove!;
    }
    const current = shooter.pos!;
    const dir = new Hex(directionHex.q - current.q, directionHex.r - current.r);

    let position = new Hex(current.q, current.r);
    while (isInGrid(position, game.grid, game.disappearedHexes)) {
      position = new Hex(position.q + dir.q, position.r + dir.r);
      if (position.equals(game.cardPos!)) {
        game.cardPos = spawnCard(game);
        return;
      }
      if (position.equals(targetPos) && !p.isImmune) {
        p.isDead = true;
        console.log('dead', p.playerType);
      }
    }
  });
}

export function updateAndEmitGameState(
  gameId: string,
  game: GameData,
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
    game.disappearedHexes = contractZone(game.currentRadius, game.grid);
    const zoneAteCard = game.disappearedHexes.some((hex) =>
      hex.equals(game.cardPos!),
    );
    if (zoneAteCard) {
      game.cardPos = spawnCard(game);
    }
  }

  game.players.forEach((p) => {
    const playerIsInForbiddenZone = game.disappearedHexes.some((h) => {
      h.equals(p.pos!);
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

export function contractZone(currentRadius: number, grid: Hex[]) {
  console.log('contractZone current radius', currentRadius);
  const newDisappeared = grid.filter(
    (h) => h.distanceTo(new Hex(0, 0)) > currentRadius,
  );
  return newDisappeared;
}

export function checkCollisionAndUpdate(currentPlayer: Player, game: GameData) {
  let currentPlayerNextPosition: Hex;

  if (currentPlayer.isShooting) {
    currentPlayerNextPosition = new Hex(
      currentPlayer.pos!.q,
      currentPlayer.pos!.r,
    );
  } else {
    currentPlayerNextPosition = new Hex(
      currentPlayer.pendingMove!.q,
      currentPlayer.pendingMove!.r,
    );
  }

  game.players.forEach((p) => {
    if (p.id === currentPlayer.id) return;
    let otherPlayerNextPosition: Hex;
    if (p.isShooting) {
      otherPlayerNextPosition = new Hex(p.pos!.q, p.pos!.r);
    } else {
      otherPlayerNextPosition = new Hex(p.pendingMove!.q, p.pendingMove!.r);
    }
    if (currentPlayerNextPosition.equals(otherPlayerNextPosition)) {
      currentPlayer.lastSeenPos = new Hex(
        currentPlayer.pos!.q,
        currentPlayer.pos!.r,
      );
      currentPlayer.didJustCollide = true;
    }
  });
}

export function checkDidPlayerCollectCardAndUpdate(
  player: Player,
  game: GameData,
) {
  if (player.pos?.equals(game.cardPos!)) {
    player.cards++;
    player.lastSeenPos = game.cardPos;
    game.cardPos = spawnCard(game);
    player.justPickedCard = true;
    player.isImmune = true;
  }
}
