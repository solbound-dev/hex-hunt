import type { Hex } from './Hex';

export class Player {
  constructor(
    public playerType: PlayerType,
    public id: string | null = null,
    public walletId: string | null = null,
    public lastSeenPos: Hex | null = null,
    public cards: number = 0,
    public pendingMove: Hex | null = null,
    public isDead: boolean = false,
    public justPickedCard: boolean = false,
    public pos: Hex | null = null,
    public isShooting: boolean | null = null,
    public isImmune: boolean = false,
    public won: boolean = false,
    public wins: number = 0,
    public diedAtMove: number | null = null,
    public previousPos: Hex | null = null,
    public lastBulletHex: Hex | null = null,
  ) {}
}

export enum PlayerType {
  Astronaut = 'Astronaut',
  Alien = 'Alien',
  Robot = 'Robot',
  Wizard = 'Wizard',
}
