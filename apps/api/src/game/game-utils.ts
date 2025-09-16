import { Hex } from './Hex';
import { DefaultEventsMap, Server } from 'socket.io';

export type GameData = {
  astronautId: string | null;
  alienId: string | null;
  lastSeenAstronautPos: Hex | null;
  lastSeenAlienPos: Hex | null;
  grid: Hex[];
  disappearedHexes: Hex[];
  warningHexes: Hex[];
  moves: number;
  cardPos: Hex | null;
  astronautCards: number;
  alienCards: number;
  astronautPendingMove: Hex | null;
  alienPendingMove: Hex | null;
  isAstronautDead: boolean;
  isAlienDead: boolean;
  currentRadius: number;
  astronautJustPickedCard: boolean;
  alienJustPickedCard: boolean;
  //this should not get sent to both players:
  astronautPos: Hex | null;
  alienPos: Hex | null;
  isAstronautShooting: boolean | null;
  isAlienShooting: boolean | null;
  isAstronautImmune: boolean;
  isAlienImmune: boolean;
};

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
  const possibleHexes = game.grid.filter(
    (h) =>
      !h.equals(game.astronautPos!) &&
      !h.equals(game.alienPos!) &&
      (!game.cardPos! || !h.equals(game.cardPos)) &&
      !game.disappearedHexes.some((d) => d.equals(h)),
  );
  const preferred = possibleHexes.filter(
    (h) =>
      h.distanceTo(game.astronautPos!) >= 2 &&
      h.distanceTo(game.alienPos!) >= 2,
  );
  if (preferred.length > 0) {
    const cardPos = preferred[Math.floor(Math.random() * preferred.length)];
    return cardPos;
  } else if (possibleHexes.length > 0) {
    const cardPos =
      possibleHexes[Math.floor(Math.random() * possibleHexes.length)];
    return cardPos;
  }
  const cardPos = null;
  return cardPos;
}

export function didCollide(game: GameData) {
  if (game.isAstronautShooting && game.isAlienShooting) {
    return false;
  }
  if (game.isAstronautShooting) {
    return (
      game.astronautPos!.q === game.alienPendingMove!.q &&
      game.astronautPos!.r === game.alienPendingMove!.r
    );
  }
  if (game.isAlienShooting) {
    return (
      game.alienPos!.q === game.astronautPendingMove!.q &&
      game.alienPos!.r === game.astronautPendingMove!.r
    );
  }
  return (
    game.astronautPendingMove!.q === game.alienPendingMove!.q &&
    game.astronautPendingMove!.r === game.alienPendingMove!.r
  );
}

export function didAstronautCollectCard(game: GameData) {
  return (
    game.astronautPos?.q === game.cardPos?.q &&
    game.astronautPos?.r === game.cardPos?.r
  );
}

export function didAlienCollectCard(game: GameData) {
  return (
    game.alienPos?.q === game.cardPos?.q && game.alienPos?.r === game.cardPos?.r
  );
}

export function didAlienGetShot(game: GameData) {
  return (
    !game.isAlienImmune &&
    ((game.astronautPendingMove!.q === game.alienPendingMove!.q &&
      game.astronautPendingMove!.r === game.alienPendingMove!.r) ||
      (game.astronautPendingMove!.q === game.alienPos!.q &&
        game.astronautPendingMove!.r === game.alienPos!.r))
  );
}

export function didAstronautGetShot(game: GameData) {
  console.log('didAstroGetShotImmune', game.isAstronautImmune);
  console.log(
    'didAstroGetShotResult',
    (!game.isAstronautImmune &&
      game.alienPendingMove!.q === game.astronautPendingMove!.q &&
      game.alienPendingMove!.r === game.astronautPendingMove!.r) ||
      (game.alienPendingMove!.q === game.astronautPos!.q &&
        game.alienPendingMove!.r === game.astronautPos!.r),
  );

  return (
    !game.isAstronautImmune &&
    ((game.alienPendingMove!.q === game.astronautPendingMove!.q &&
      game.alienPendingMove!.r === game.astronautPendingMove!.r) ||
      (game.alienPendingMove!.q === game.astronautPos!.q &&
        game.alienPendingMove!.r === game.astronautPos!.r))
  );
}

export function contractZone(currentRadius: number, grid: Hex[]) {
  console.log('contractZone current radius', currentRadius);
  const newDisappeared = grid.filter(
    (h) => h.distanceTo(new Hex(0, 0)) > currentRadius,
  );
  return newDisappeared;
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
  if (
    game.disappearedHexes.some(
      (hex) => hex.q === game.astronautPos?.q && hex.r === game.astronautPos.r,
    )
  ) {
    game.isAstronautDead = true;
  }
  if (
    game.disappearedHexes.some(
      (hex) => hex.q === game.alienPos?.q && hex.r === game.alienPos.r,
    )
  ) {
    console.log('alien died');
    game.isAlienDead = true;
  }

  websocketServer.to(gameId).emit('gameState', game);
  if (!game.astronautJustPickedCard) {
    game.isAstronautImmune = false;
  }
  if (!game.alienJustPickedCard) {
    game.isAlienImmune = false;
  }
  game.astronautPendingMove = null;
  game.alienPendingMove = null;
  game.isAstronautShooting = null;
  game.isAlienShooting = null;
}

export function shootInDirection(
  directionHex: Hex,
  game: GameData,
  shooter: 'astronaut' | 'alien',
) {
  let targetPos: Hex;
  if (shooter === 'astronaut') {
    if (game.isAlienShooting) {
      targetPos = game.alienPos!;
    } else {
      targetPos = game.alienPendingMove!;
    }
  } else {
    if (game.isAstronautShooting) {
      targetPos = game.astronautPos!;
    } else {
      targetPos = game.astronautPendingMove!;
    }
  }

  const current = shooter === 'astronaut' ? game.astronautPos! : game.alienPos!;
  const dir = new Hex(directionHex.q - current.q, directionHex.r - current.r);
  let position = new Hex(current.q, current.r);
  while (isInGrid(position, game.grid, game.disappearedHexes)) {
    position = new Hex(position.q + dir.q, position.r + dir.r);
    console.log('shooting position', position);
    if (position.equals(game.cardPos!)) {
      game.cardPos = spawnCard(game);
      return;
    }

    //TODO: check if alien got shot
    if (position.equals(targetPos)) {
      console.log('alien got shot');
      if (shooter === 'astronaut') {
        game.isAlienDead = true;
      } else {
        game.isAstronautDead = true;
      }
    }
  }
}
