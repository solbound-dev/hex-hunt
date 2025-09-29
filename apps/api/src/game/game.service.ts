import { Injectable } from '@nestjs/common';
import { Game } from './Game';
import {
  isNeighbor,
  MAX_PLAYERS,
  MOVE_DURATION_IN_SECONDS,
  START_GRID_RADIUS,
} from './game-utils';
import { Player, PlayerType } from './Player';
import { Hex } from './Hex';

@Injectable()
export class GameService {
  private games: Record<string, Game> = {};

  getGames() {
    console.log('service', this.games);
    return Object.keys(this.games);
  }

  getGame(id: string) {
    return this.games[id];
  }

  createGame(id: string, game: Game) {
    this.games[id] = game;
  }

  removeGame(id: string) {
    delete this.games[id];
  }

  startGame(gameId: string) {
    const game = this.games[gameId];
    console.log('games', this.games);
    if (!game || game.started) return;

    game.started = true;
    game.spawnCard();
    game.moveExpiryDate = new Date(
      new Date().getTime() + MOVE_DURATION_IN_SECONDS * 1000,
    ).toISOString();
    game.players.forEach((p) => (p.pendingMove = null));
    return game;
  }

  joinGame(clientId: string, gameId: string) {
    if (!this.games[gameId]) {
      this.games[gameId] = new Game();
      this.games[gameId].generateGrid();
    }

    const game = this.games[gameId];

    if (game.players.length >= MAX_PLAYERS || game.started) {
      return null;
    }

    const playerTypeOrder = [
      PlayerType.Astronaut,
      PlayerType.Alien,
      PlayerType.Robot,
      PlayerType.Wizard,
    ];
    const newPlayerType = playerTypeOrder[game.players.length];
    const pos = game.getAvailablePlayerPos();
    const newPlayer = new Player(newPlayerType, clientId, pos, pos);
    game.players.push(newPlayer);

    if (game.players.length === MAX_PLAYERS) {
      game.spawnCard();
      game.moveExpiryDate = new Date(
        Date.now() + MOVE_DURATION_IN_SECONDS * 1000,
      ).toISOString();
      game.players.forEach((p) => (p.pendingMove = null));
      game.started = true;
    }

    console.log('games', this.games);
    return { game, newPlayer };
  }

  updateGame(
    clientId: string,
    data: {
      gameId: string;
      move: Hex | null;
      isShooting: boolean;
      didRunOutOfTime: boolean;
    },
  ) {
    const game = this.games[data.gameId];
    if (!game) return null;

    const gameContainsClient = game.players.some((p) => p.id === clientId);
    if (!gameContainsClient) return null;

    if (data.move) {
      if (!game.isInGrid(data.move)) {
        return null;
      }
    }

    const gameContainsWinner = game.players.some((p) => p.won);
    if (gameContainsWinner) return null;

    game.players.forEach((p) => {
      if (clientId === p.id) {
        const moveTooLate = new Date() > new Date(game.moveExpiryDate);
        if (data.didRunOutOfTime || moveTooLate) {
          p.isDead = true;
        }
      }
    });

    game.players.forEach((p) => {
      if (clientId === p.id) {
        if (p.isShooting === null) {
          p.isShooting = data.isShooting;
        }

        if (data.move) {
          if (p.pendingMove === null) {
            if (p.pos.equals(data.move)) return;
            if (!isNeighbor(p.pos, data.move)) return;
          }
          p.pendingMove = new Hex(data.move.q, data.move.r);
        }
      }
    });

    game.players.forEach((p) => (p.justPickedCard = false));

    const waitingForMoves = game.players.some(
      (p) => p.pendingMove === null && !p.isDead,
    );
    if (!waitingForMoves) {
      game.players.forEach((p) => {
        if (p.isShooting) {
          p.lastSeenPos = p.pos;
          game.shootInDirection(p.pendingMove!, p);
        }
      });

      game.players.forEach((p) => game.checkCollisionAndUpdate(p));

      game.players.forEach((p) => {
        if (!p.isShooting && !p.didJustCollide && !p.isDead) {
          p.pos = new Hex(p.pendingMove!.q, p.pendingMove!.r);
        }
      });

      game.players.forEach((p) => game.checkDidPlayerCollectCardAndUpdate(p));

      game.updateState();

      return game;
    }
  }

  restartGame(clientId: string, gameId: string) {
    const game = this.games[gameId];
    if (!game) return null;

    const gameContainsClient = game.players.some((p) => p.id === clientId);
    if (!gameContainsClient) return null;

    const gameContainsWinner = game.players.some((p) => p.won);
    if (!gameContainsWinner) return null;

    game.moveExpiryDate = '';
    game.disappearedHexes = [];
    game.warningHexes = [];
    game.moves = 0;
    game.cardPos = null;
    game.currentRadius = START_GRID_RADIUS;

    game.players.forEach((p) => {
      p.pos = game.getAvailablePlayerPos();
      p.lastSeenPos = p.pos;
      p.won = false;
      p.cards = 0;
      p.pendingMove = null;
      p.isDead = false;
      p.justPickedCard = false;
      p.isShooting = null;
      p.isImmune = false;
      p.didJustCollide = false;
    });

    game.spawnCard();
    game.moveExpiryDate = new Date(
      new Date().getTime() + MOVE_DURATION_IN_SECONDS * 1000,
    ).toISOString();

    return game;
  }
}
