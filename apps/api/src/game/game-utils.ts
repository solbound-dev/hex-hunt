import { Hex } from './Hex';

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
  //this should not get sent to both players:
  astronautPos: Hex | null;
  alienPos: Hex | null;
  isAstronautShooting: boolean | null;
  isAlienShooting: boolean | null;
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
  if (move.q === pos?.q && move.r === pos?.r) {
    return true;
  }
  return false;
}

export function isInGrid(hex: Hex, grid: Hex[], disappearedHexes: Hex[]) {
  return (
    grid.some((h) => h.q === hex.q && h.r === hex.r) &&
    !disappearedHexes.some((h) => h.q === hex.q && h.r === hex.r)
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
  //TODO

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
  console.log('shooting', game.isAstronautShooting, game.isAlienShooting);
  return (
    !game.isAstronautShooting &&
    !game.isAlienShooting &&
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
    (game.astronautPendingMove!.q === game.alienPendingMove!.q &&
      game.astronautPendingMove!.r === game.alienPendingMove!.r) ||
    (game.astronautPendingMove!.q === game.alienPos!.q &&
      game.astronautPendingMove!.r === game.alienPos!.r)
  );
}

export function didAstronautGetShot(game: GameData) {
  return (
    (game.alienPendingMove!.q === game.astronautPendingMove!.q &&
      game.alienPendingMove!.r === game.astronautPendingMove!.r) ||
    (game.alienPendingMove!.q === game.astronautPos!.q &&
      game.alienPendingMove!.r === game.astronautPos!.r)
  );
}

export function contractZone(currentRadius: number, grid: Hex[]) {
  console.log('contractZone current radius', currentRadius);
  const newDisappeared = grid.filter(
    (h) => h.distanceTo(new Hex(0, 0)) > currentRadius,
  );
  return newDisappeared;
}
