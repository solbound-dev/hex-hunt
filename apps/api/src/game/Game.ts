import { START_GRID_RADIUS } from './game-utils';
import { Hex } from './Hex';
import { Player } from './Player';

export class Game {
  constructor(
    public moveExpiryDate: string = '',
    public disappearedHexes: Hex[] = [],
    public warningHexes: Hex[] = [],
    public moves: number = 0,
    public grid: Hex[] = [],
    public cardPos: Hex | null = null,
    public currentRadius: number = START_GRID_RADIUS,
    public started: boolean = false,
    //this should not get sent to both players:
    public players: Player[] = [], //we currently send position of every player to every player
  ) {}

  getAvailablePlayerPos(): Hex {
    if (this.grid.length === 0) {
      throw new Error('Grid is empty, cannot get available player position.');
    }
    let pos: Hex;
    while (true) {
      const randomIndex = Math.floor(Math.random() * this.grid.length);
      pos = this.grid[randomIndex];
      if (!this.players.some((p) => p.pos?.equals(pos))) {
        break;
      }
    }
    return pos;
  }

  generateGrid() {
    for (let q = -this.currentRadius; q <= this.currentRadius; q++) {
      const r1 = Math.max(-this.currentRadius, -q - this.currentRadius);
      const r2 = Math.min(this.currentRadius, -q + this.currentRadius);
      for (let r = r1; r <= r2; r++) {
        const hex = new Hex(q, r);
        this.grid.push(hex);
      }
    }
  }

  isInGrid(hex: Hex) {
    const hexInstance = new Hex(hex.q, hex.r);
    return (
      this.grid.some((h) => h.equals(hexInstance)) &&
      !this.disappearedHexes.some((h) => h.equals(hexInstance))
    );
  }

  spawnCard() {
    const possibleHexes = this.grid.filter((h) => {
      const hexIsTaken = this.players.some((p) => p.pos.equals(h));
      const hexDisappeared = this.disappearedHexes.some((d) => d.equals(h));

      return !hexIsTaken && !hexDisappeared && !h.equals(this.cardPos!);
    });

    const cardPos =
      possibleHexes[Math.floor(Math.random() * possibleHexes.length)];

    this.cardPos = cardPos;
  }

  shootInDirection(directionHex: Hex, shooter: Player) {
    this.players.forEach((p) => {
      if (p.id === shooter.id) return;

      let targetPos: Hex;
      if (p.isShooting) {
        targetPos = p.pos;
      } else {
        targetPos = p.pendingMove!;
      }
      const current = shooter.pos;
      const dir = new Hex(
        directionHex.q - current.q,
        directionHex.r - current.r,
      );
      let position = new Hex(current.q, current.r);
      while (this.isInGrid(position)) {
        position = new Hex(position.q + dir.q, position.r + dir.r);
        if (position.equals(this.cardPos!)) {
          this.spawnCard();
          return;
        }
        if (position.equals(targetPos) && !p.isImmune) {
          p.isDead = true;
          console.log('dead', p.playerType);
        }
      }
    });
  }

  contractZone() {
    console.log('contractZone current radius', this.currentRadius);
    const newDisappeared = this.grid.filter(
      (h) => h.distanceTo(new Hex(0, 0)) > this.currentRadius,
    );
    this.disappearedHexes = newDisappeared;
  }

  checkCollisionAndUpdate(currentPlayer: Player) {
    let currentPlayerNextPosition: Hex;

    if (currentPlayer.isDead) return;
    if (currentPlayer.isShooting) {
      currentPlayerNextPosition = new Hex(
        currentPlayer.pos.q,
        currentPlayer.pos.r,
      );
    } else {
      currentPlayerNextPosition = new Hex(
        currentPlayer.pendingMove!.q,
        currentPlayer.pendingMove!.r,
      );
    }

    this.players.forEach((p) => {
      if (p.id === currentPlayer.id) return;
      if (p.isDead) return;
      let otherPlayerNextPosition: Hex;
      if (p.isShooting) {
        otherPlayerNextPosition = new Hex(p.pos.q, p.pos.r);
      } else {
        otherPlayerNextPosition = new Hex(p.pendingMove!.q, p.pendingMove!.r);
      }
      if (currentPlayerNextPosition.equals(otherPlayerNextPosition)) {
        currentPlayer.lastSeenPos = new Hex(
          currentPlayer.pos.q,
          currentPlayer.pos.r,
        );
        currentPlayer.didJustCollide = true;
      }
    });
  }

  checkDidPlayerCollectCardAndUpdate(player: Player) {
    if (player.pos.equals(this.cardPos!)) {
      player.cards++;
      player.lastSeenPos = this.cardPos!;
      this.spawnCard();
      player.justPickedCard = true;
      player.isImmune = true;
    }
  }

  updateState() {
    this.moves++;
    if (this.moves % 8 === 0 && this.currentRadius > 1) {
      this.currentRadius--;
      this.contractZone();
      const zoneAteCard = this.disappearedHexes.some((hex) =>
        hex.equals(this.cardPos!),
      );
      if (zoneAteCard) {
        this.spawnCard();
      }
    }

    this.players.forEach((p) => {
      const playerIsInForbiddenZone = this.disappearedHexes.some((h) => {
        h.equals(p.pos);
      });
      if (playerIsInForbiddenZone) {
        console.log(`${p.playerType} died`);
        p.isDead = true;
      }
    });

    this.players.forEach((p) => {
      if (p.cards === 3 && p.pos?.equals(new Hex(0, 0))) {
        this.players.forEach((op) => {
          if (op.id !== p.id) {
            op.isDead = true;
          }
        });
      }
    });

    const numberOfDeadPlayers = this.players.reduce(
      (prev, curr) => prev + (curr.isDead ? 1 : 0),
      0,
    );

    if (numberOfDeadPlayers === this.players.length - 1) {
      this.players.forEach((p) => {
        if (!p.isDead) {
          p.won = true;
          p.wins++;
        }
      });
    }

    //emit was here

    this.players.forEach((p) => {
      if (!p.justPickedCard) {
        p.isImmune = false;
      }
      p.pendingMove = null;
      p.isShooting = null;
      p.didJustCollide = false;
    });
  }
}
