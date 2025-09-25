import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  isNeighbor,
  MAX_PLAYERS,
  MOVE_DURATION,
  updateAndEmitGameState,
} from './game-utils';
import { Hex } from './Hex';
import { Game } from './Game';
import { Player, PlayerType } from './Player';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private games: Record<string, Game> = {};

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }
  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('start')
  handleStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const { gameId } = data;

    if (!this.games[gameId]) {
      console.log(`Game ${gameId} doesn't exists`);
      return;
    }

    const game = this.games[gameId];

    if (game.started) return;

    game.started = true;
    game.spawnCard();
    this.server.to(gameId).emit('gameStart', this.games[gameId]);
    console.log('GAME STARTED===============================');
    game.moveExpiryDate = new Date(
      new Date().getTime() + MOVE_DURATION * 1000,
    ).toISOString();
    game.players.forEach((p) => (p.pendingMove = null));
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const { gameId } = data;
    const currentGameRoom = Array.from(client.rooms).find(
      (room) => room !== client.id,
    );
    if (currentGameRoom) {
      console.log("Client already has room, you can't join another one ");
      return;
    }
    if (!this.games[gameId]) {
      this.games[gameId] = new Game();
      this.games[gameId].generateGrid();
    }

    const game = this.games[gameId];

    if (game.players.length >= MAX_PLAYERS || game.started) {
      client.emit('gameFull');
      return;
    }

    const playerTypeOrder = [
      PlayerType.Astronaut,
      PlayerType.Alien,
      PlayerType.Robot,
      PlayerType.Wizard,
    ];
    const newPlayerType = playerTypeOrder[game.players.length];

    await client.join(gameId);

    const pos = game.getAvailablePlayerPos();
    const newPlayer = new Player(newPlayerType, client.id, pos, pos);
    game.players.push(newPlayer);

    this.server.to(gameId).emit('playerJoined', { playerId: client.id });

    if (game.players.length === MAX_PLAYERS) {
      game.spawnCard();
      game.moveExpiryDate = new Date(
        new Date().getTime() + MOVE_DURATION * 1000,
      ).toISOString();
      this.server.to(gameId).emit('gameStart', this.games[gameId]);
      console.log('GAME STARTED===============================');
      game.players.forEach((p) => (p.pendingMove = null));
    }
  }

  @SubscribeMessage('updateGame')
  handleUpdateGame(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      gameId: string;
      move: Hex | null;
      isShooting: boolean;
      didRunOutOfTime: boolean;
    },
  ) {
    const game = this.games[data.gameId];

    if (!game) return;

    const gameContainsClient = game.players.some((p) => p.id === client.id);
    if (!gameContainsClient) return;

    if (data.move) {
      if (!game.isInGrid(data.move)) {
        return;
      }
    }

    game.players.forEach((p) => {
      if (client.id === p.id) {
        const moveTooLate = new Date() > new Date(game.moveExpiryDate);
        if (data.didRunOutOfTime || moveTooLate) {
          p.isDead = true;
        }
      }
    });

    game.players.forEach((p) => {
      if (client.id === p.id) {
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

      updateAndEmitGameState(data.gameId, game, this.server);
    }
  }
}
