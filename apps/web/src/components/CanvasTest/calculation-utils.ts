export const CANVAS_SIZE = 1000;
export const HEX_SIZE = 70; // radius of hexagon
export const PI = 3.14159;
export const GRID_RADIUS = 3;

export type GameData = {
  grid: Hex[];
  disappearedHexes: Hex[];
  warningHexes: Hex[];
  moves: number;
  cardPos: Hex | null;
  currentRadius: number;
  //this should not get sent to both players:
  players: Player[];
};

export enum PlayerType {
  Astronaut = 'Astronaut',
  Alien = 'Alien',
  // Robot = 'Robot',
  // Drone = 'Drone',
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
  ) {}
}

export class Hex {
  q: number;
  r: number;
  s: number;

  constructor(q: number, r: number) {
    this.q = q;
    this.r = r;
    this.s = -q - r;
  }

  equals(other: Hex) {
    return other
      ? this.q === other.q && this.r === other.r && this.s === other.s
      : false;
  }

  distanceTo(other: Hex) {
    return (
      (Math.abs(this.q - other.q) +
        Math.abs(this.r - other.r) +
        Math.abs(this.s - other.s)) /
      2
    );
  }

  neighbors() {
    const directions = [
      new Hex(1, 0),
      new Hex(1, -1),
      new Hex(0, -1),
      new Hex(-1, 0),
      new Hex(-1, 1),
      new Hex(0, 1),
    ];
    return directions.map((dir) => new Hex(this.q + dir.q, this.r + dir.r));
  }

  toString() {
    return `${this.q},${this.r}`;
  }
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

export function pixelToHex(x: number, y: number) {
  x = (x - CANVAS_SIZE / 2) / HEX_SIZE;
  y = (y - CANVAS_SIZE / 2) / HEX_SIZE;
  const q = (Math.sqrt(3) / 3) * x - (1 / 3) * y;
  const r = (2 / 3) * y;
  return roundHex(new Hex(q, r));
}

export function hexToPixel(hex: Hex) {
  const x = HEX_SIZE * Math.sqrt(3) * (hex.q + hex.r / 2);
  const y = ((HEX_SIZE * 3) / 2) * hex.r;
  return { x: x + CANVAS_SIZE / 2, y: y + CANVAS_SIZE / 2 };
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
