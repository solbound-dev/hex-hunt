import { START_GRID_RADIUS } from './game-utils';
import { Hex } from './Hex';
import { Player } from './Player';

export class Game {
  constructor(
    public tier: number,
    public isPrivate: boolean,
    public interval: NodeJS.Timeout | null = null,
    public createdAt: string = new Date().toISOString(),
    public disappearedHexes: Hex[] = [],
    public warningHexes: Hex[] = [],
    public moves: number = 0,
    public grid: Hex[] = [],
    public cardPos: Hex | null = null,
    public previousCardPos: Hex | null = null,
    public currentRadius: number = START_GRID_RADIUS,
    public started: boolean = false,
    public draw: boolean = false,
    //this should not get sent to both players:
    public players: Player[] = [], //we currently send position of every player to every player
  ) {}

  serialize() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { interval, ...rest } = this;
    return rest;
  }

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
    if (shooter.pos.equals(directionHex)) return false;
    let shotCard = false;
    shooter.previousPos = shooter.pos;
    const RANGE = 3;

    this.players.forEach((p) => {
      if (p.walletId === shooter.walletId) return false;

      const targetPos: Hex = p.pos;
      const current = shooter.pos;
      const dir = new Hex(
        directionHex.q - current.q,
        directionHex.r - current.r,
      );
      let position = new Hex(current.q, current.r);
      while (current.distanceTo(position) < RANGE && this.isInGrid(position)) {
        position = new Hex(position.q + dir.q, position.r + dir.r);
        if (position.equals(this.cardPos!)) {
          shooter.lastBulletHex = this.cardPos;
          this.previousCardPos = this.cardPos;
          shotCard = true;
          return shotCard;
        }
        if (position.equals(targetPos) && !p.isImmune) {
          console.log(shooter.playerType, 'killed', p.playerType);
          p.isDead = true;
          p.diedAtMove = this.moves;
          p.lastSeenPos = new Hex(position.q, position.r);

          if (!shooter.lastBulletHex) shooter.lastBulletHex = p.pos;
          else {
            shooter.lastBulletHex =
              shooter.lastBulletHex.distanceTo(shooter.pos) >
              p.pos.distanceTo(shooter.pos)
                ? shooter.lastBulletHex
                : p.pos;
          }
        }
      }
      if (!shooter.lastBulletHex) {
        shooter.lastBulletHex = new Hex(position.q, position.r);
      }
    });

    return shotCard;
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
      if (p.walletId === currentPlayer.walletId) return;
      if (p.isDead) return;
      let otherPlayerNextPosition: Hex;
      if (p.isShooting) {
        otherPlayerNextPosition = new Hex(p.pos.q, p.pos.r);
      } else {
        otherPlayerNextPosition = new Hex(p.pendingMove!.q, p.pendingMove!.r);
      }
      if (currentPlayerNextPosition.equals(otherPlayerNextPosition)) {
        currentPlayer.lastSeenPos = new Hex(
          currentPlayer.pendingMove!.q,
          currentPlayer.pendingMove!.r,
        );
        currentPlayer.previousPos = currentPlayer.pos;
        currentPlayer.didJustCollide = true;
      }
    });
  }

  checkDidPlayerCollectCardAndUpdate(player: Player) {
    if (player.pos.equals(this.cardPos!)) {
      if (player.cards < 3) {
        player.cards++;
      }
      player.lastSeenPos = this.cardPos!;
      this.spawnCard();
      player.justPickedCard = true;
      player.isImmune = true;
    }
  }

  updateState() {
    this.moves++;
    if (this.moves % 6 === 0 && this.currentRadius > 1) {
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
      const playerIsInForbiddenZone = this.disappearedHexes.some((h) =>
        h.equals(p.pos),
      );

      if (playerIsInForbiddenZone) {
        if (!p.isDead) {
          console.log(`${p.playerType} died`);
          p.isDead = true;
          p.diedAtMove = this.moves - 1;
          p.lastSeenPos = new Hex(p.pos.q, p.pos.r);
        }
      }
    });

    this.players.forEach((p) => {
      if (p.cards === 3 && p.pos?.equals(new Hex(0, 0))) {
        this.players.forEach((op) => {
          if (op.walletId !== p.walletId && !p.isDead) {
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

    if (numberOfDeadPlayers === this.players.length) {
      this.draw = true;
    }

    this.players.forEach((p) => {
      if (!p.justPickedCard) {
        p.isImmune = false;
      }
      p.pendingMove = null;
      p.isShooting = null;
    });
  }

  getPlayerTypeByWalletId(walletId: string) {
    return this.players.find((p) => p.walletId === walletId)?.playerType;
  }
}
