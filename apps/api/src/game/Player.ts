import { Hex } from './Hex';

export class Player {
  constructor(
    public playerType: PlayerType,
    public id: string,
    public pos: Hex,
    public lastSeenPos: Hex,
    public cards: number = 0,
    public pendingMove: Hex | null = null,
    public isDead: boolean = false,
    public justPickedCard: boolean = false,
    public isShooting: boolean | null = null,
    public isImmune: boolean = false,
    public didJustCollide: boolean = false,
    public didWin: boolean = false,
  ) {}
}

export enum PlayerType {
  Astronaut = 'Astronaut',
  Alien = 'Alien',
  Robot = 'Robot',
  Wizard = 'Wizard',
}
