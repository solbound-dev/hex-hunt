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
