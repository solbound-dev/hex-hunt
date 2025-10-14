import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

import { Game } from './Game';
import {
  isNeighbor,
  MAX_PLAYERS,
  MOVE_DURATION_IN_SECONDS,
  START_GRID_RADIUS,
} from './game-utils';
import { Player, PlayerType } from './Player';
import { Hex } from './Hex';

type Token = {
  walletId: string;
  sub: string;
  iat: number;
  exp: number;
};

@Injectable()
export class GameService {
  public games: Record<string, Game> = {};

  getAvailableGames() {
    const availableGames: string[] = [];

    for (const key in this.games) {
      if (!this.games[key].started) {
        availableGames.push(key);
      }
    }

    return availableGames;
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

  startGame(gameId: string, server: Server) {
    const game = this.games[gameId];
    if (!game || game.started) return;

    game.started = true;
    game.spawnCard();
    game.moveExpiryDate = new Date(
      new Date().getTime() + MOVE_DURATION_IN_SECONDS * 1000,
    ).toISOString();
    game.players.forEach((p) => (p.pendingMove = null));

    console.log('game before interval', game);

    const interval = setInterval(() => {
      game.players.forEach((p) => {
        if (!p.pendingMove) {
          p.isDead = true;
        }
      });

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

      const gameHasWinner = game.players.some((p) => p.won);

      if (game.draw || gameHasWinner) {
        clearInterval(interval);
      }
      server.to(gameId).emit('gameState', game.serialize());
    }, MOVE_DURATION_IN_SECONDS * 1000);

    game.interval = interval;

    return game;
  }

  getGameByToken(tokenString: string, clientId: string) {
    const token = JSON.parse(
      Buffer.from(tokenString.split('.')[1], 'base64').toString(),
    ) as Token;

    for (const game in this.games) {
      const gameContainsWallet = this.games[game].players.some(
        (p) => p.walletId === token.walletId,
      );
      if (gameContainsWallet) {
        this.games[game].players.forEach((p) => {
          if (p.walletId === token.walletId) {
            p.id = clientId;
          }
        });
        return { gameId: game, gameObject: this.games[game] };
      }
    }
  }

  leaveGame(gameId: string, tokenString: string) {
    const token = JSON.parse(
      Buffer.from(tokenString.split('.')[1], 'base64').toString(),
    ) as Token;
    if (!token) return;

    const game = this.games[gameId];
    if (!game) return;
    game.players = game.players.filter((p) => {
      return p.walletId !== token.walletId;
    });
    return game;
  }

  quickJoinGame(clientId: string, tier: number, tokenString: string) {
    const token = JSON.parse(
      Buffer.from(tokenString.split('.')[1], 'base64').toString(),
    ) as Token;
    if (!token) return;

    let availableGameId = '';

    for (const gameId in this.games) {
      if (this.games[gameId].started) continue;
      if (this.games[gameId].tier !== tier) continue;
      if (this.games[gameId].players.length >= MAX_PLAYERS) continue;
      if (this.games[gameId].isPrivate) continue;
      availableGameId = gameId;
    }
    if (availableGameId) {
      return this.joinGame(clientId, availableGameId, tokenString, tier, false);
    }

    const newGameId = Math.random().toString(36).substring(2, 7);
    return this.joinGame(clientId, newGameId, tokenString, tier, false);
  }

  hostPrivateGame(clientId: string, tier: number, tokenString: string) {
    const token = JSON.parse(
      Buffer.from(tokenString.split('.')[1], 'base64').toString(),
    ) as Token;
    if (!token) return;

    //possible that that gameId already exists but there is a lot of combinations
    const newGameId = Math.random().toString(36).substring(2, 7);
    return this.joinGame(clientId, newGameId, tokenString, tier, true);
  }

  joinPrivateGame(clientId: string, gameId: string, tokenString: string) {
    const game = this.games[gameId];
    if (!game) return;

    return this.joinGame(clientId, gameId, tokenString, game.tier, true);
  }

  joinGame(
    clientId: string,
    gameId: string,
    tokenString: string,
    tier: number,
    isPrivate: boolean,
  ) {
    const token = JSON.parse(
      Buffer.from(tokenString.split('.')[1], 'base64').toString(),
    ) as Token;

    if (!this.games[gameId]) {
      this.games[gameId] = new Game(tier, isPrivate);
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
    const newPlayer = new Player(
      newPlayerType,
      clientId,
      token.walletId,
      pos,
      pos,
    );
    game.players.push(newPlayer);

    return { gameId, game, newPlayer };
  }

  updateGame(
    data: {
      gameId: string;
      move: Hex | null;
      isShooting: boolean;
      didRunOutOfTime: boolean;
    },
    tokenString: string,
  ) {
    const token = JSON.parse(
      Buffer.from(tokenString.split('.')[1], 'base64').toString(),
    ) as Token;

    if (!token) return;

    const game = this.games[data.gameId];
    if (!game) return null;

    const gameContainsClient = game.players.some(
      (p) => p.walletId === token.walletId,
    );
    if (!gameContainsClient) return null;

    if (data.move) {
      if (!game.isInGrid(data.move)) {
        return null;
      }
    }

    const gameContainsWinner = game.players.some((p) => p.won);
    if (gameContainsWinner) return null;

    if (game.draw) return null;

    // game.players.forEach((p) => {
    //   if (token.walletId === p.walletId) {
    //     const moveTooLate = new Date() > new Date(game.moveExpiryDate);
    //     if (data.didRunOutOfTime || moveTooLate) {
    //       p.isDead = true;
    //     }
    //   }
    // });

    game.players.forEach((p) => {
      if (token.walletId === p.walletId) {
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

    // const waitingForMoves = game.players.some(
    //   (p) => p.pendingMove === null && !p.isDead,
    // );

    //do this part at the end of interval
    // if (!waitingForMoves) {
    //   game.players.forEach((p) => {
    //     if (p.isShooting) {
    //       p.lastSeenPos = p.pos;
    //       game.shootInDirection(p.pendingMove!, p);
    //     }
    //   });

    //   game.players.forEach((p) => game.checkCollisionAndUpdate(p));

    //   game.players.forEach((p) => {
    //     if (!p.isShooting && !p.didJustCollide && !p.isDead) {
    //       p.pos = new Hex(p.pendingMove!.q, p.pendingMove!.r);
    //     }
    //   });

    //   game.players.forEach((p) => game.checkDidPlayerCollectCardAndUpdate(p));

    //   game.updateState();

    //   return game;
    // }
  }

  restartGame(clientId: string, gameId: string, tokenString: string) {
    const token = JSON.parse(
      Buffer.from(tokenString.split('.')[1], 'base64').toString(),
    ) as Token;
    if (!token) return;

    const game = this.games[gameId];
    if (!game) return null;

    const gameContainsClient = game.players.some(
      (p) => p.walletId === token.walletId,
    );
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
