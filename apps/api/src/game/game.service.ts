import { Injectable } from '@nestjs/common';
import { Game } from './Game';

@Injectable()
export class GameService {
  private games: Record<string, Game> = {};

  getGames(): Game[] {
    return Object.values(this.games);
  }

  getGame(id: string): Game | undefined {
    return this.games[id];
  }

  createGame(id: string, game: Game) {
    this.games[id] = game;
  }

  removeGame(id: string) {
    delete this.games[id];
  }
}
