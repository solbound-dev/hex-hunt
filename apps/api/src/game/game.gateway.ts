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
import { parse } from 'cookie';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    const availableGames = this.gameService.getAvailableGames();
    console.log('connection', availableGames);
    this.server.to(client.id).emit('availableGames', availableGames);
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
    const availableGames = this.gameService.getAvailableGames();
    this.server.emit('availableGames', availableGames);
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const cookie = client.handshake.headers.cookie;
    console.log('cookie', cookie);
    const token = parse(cookie || '')?.accessToken;
    console.log('token', token);
    if (!token) {
      //TODO: nekako hendlat neki emit il nesto
      return;
    }

    const { gameId } = data;

    if (!gameId) return;

    const currentGameRoom = Array.from(client.rooms).find(
      (room) => room !== client.id,
    );
    if (currentGameRoom) {
      console.log(
        "Client (socket) already has room, you can't join another one ",
      );
      client.emit('alreadyHasRoom');
      return;
    }
    const result = this.gameService.joinGame(client.id, gameId, token);
    if (!result) {
      client.emit('gameFull');
      return;
    }
    const { game, newPlayer } = result;
    await client.join(gameId);
    const availableGames = this.gameService.getAvailableGames();
    console.log('availableGames', availableGames);
    this.server.to(gameId).emit('playerJoined', {
      playerId: newPlayer.id,
    });
    this.server.emit('availableGames', availableGames);

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
