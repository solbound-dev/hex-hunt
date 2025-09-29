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
import { Hex } from './Hex';
import { GameService } from './game.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  // private games: Record<string, Game> = {};
  constructor(private readonly gameService: GameService) {}

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

    const game = this.gameService.startGame(gameId);
    if (!game) {
      console.log(`Game ${gameId} does not exist or is already started`);
      return;
    }

    this.server.to(gameId).emit('gameStart', game);
    console.log(`GAME ${gameId} STARTED===============================`);
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
    const result = this.gameService.joinGame(client.id, gameId);
    if (!result) {
      client.emit('gameFull');
      return;
    }
    const { game, newPlayer } = result;
    await client.join(gameId);
    this.server.to(gameId).emit('playerJoined', { playerId: newPlayer.id });
    if (game.started) {
      this.server.to(gameId).emit('gameStart', game);
      console.log('GAME STARTED===============================');
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
    const game = this.gameService.updateGame(client.id, data);
    if (!game) return;
    this.server.to(data.gameId).emit('gameState', game);

    // const game = this.games[data.gameId];
    // if (!game) return;

    // const gameContainsClient = game.players.some((p) => p.id === client.id);
    // if (!gameContainsClient) return;

    // if (data.move) {
    //   if (!game.isInGrid(data.move)) {
    //     return;
    //   }
    // }

    // const gameContainsWinner = game.players.some((p) => p.won);
    // if (gameContainsWinner) return;

    // game.players.forEach((p) => {
    //   if (client.id === p.id) {
    //     const moveTooLate = new Date() > new Date(game.moveExpiryDate);
    //     if (data.didRunOutOfTime || moveTooLate) {
    //       p.isDead = true;
    //     }
    //   }
    // });

    // game.players.forEach((p) => {
    //   if (client.id === p.id) {
    //     if (p.isShooting === null) {
    //       p.isShooting = data.isShooting;
    //     }

    //     if (data.move) {
    //       if (p.pendingMove === null) {
    //         if (p.pos.equals(data.move)) return;
    //         if (!isNeighbor(p.pos, data.move)) return;
    //       }
    //       p.pendingMove = new Hex(data.move.q, data.move.r);
    //     }
    //   }
    // });

    // game.players.forEach((p) => (p.justPickedCard = false));

    // const waitingForMoves = game.players.some(
    //   (p) => p.pendingMove === null && !p.isDead,
    // );

    // if (!waitingForMoves) {
    //   game.players.forEach((p) => {
    //     if (p.isShooting) {
    //       p.lastSeenPos = p.pos;
    //       game.shootInDirection(p.pendingMove, p);
    //     }
    //   });

    //   game.players.forEach((p) => game.checkCollisionAndUpdate(p));

    //   game.players.forEach((p) => {
    //     if (!p.isShooting && !p.didJustCollide && !p.isDead) {
    //       p.pos = new Hex(p.pendingMove!.q, p.pendingMove!.r);
    //     }
    //   });

    //   game.players.forEach((p) => game.checkDidPlayerCollectCardAndUpdate(p));

    //   updateAndEmitGameState(data.gameId, game, this.server);
  }

  @SubscribeMessage('restartGame')
  handleRestartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const game = this.gameService.restartGame(client.id, data.gameId);

    if (!game) return;

    this.server.to(data.gameId).emit('gameStart', game);
  }
}
