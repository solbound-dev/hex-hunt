import { Hex } from './Hex';

export class Player {
  constructor(
    public playerType: PlayerType,
    public id: string, //socket.io id
    public walletId: string,
    public pos: Hex,
    public lastSeenPos: Hex,
    public previousPos: Hex,
    public won: boolean = false,
    public wins: number = 0,
    public cards: number = 0,
    public pendingMove: Hex | null = null,
    public isDead: boolean = false,
    public justPickedCard: boolean = false,
    public isShooting: boolean | null = null,
    public isImmune: boolean = false,
    public didJustCollide: boolean = false,
    public diedAtMove: number | null = null,
  ) {}
}

export enum PlayerType {
  Astronaut = 'Astronaut',
  Alien = 'Alien',
  Robot = 'Robot',
  Wizard = 'Wizard',
}
