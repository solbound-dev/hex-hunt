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
import { MAX_PLAYERS } from './game-utils';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(private readonly gameService: GameService) {}

  async handleConnection(client: Socket) {
    const cookie = client.handshake.headers.cookie;
    const token = parse(cookie || '')?.accessToken;
    if (!token) {
      //TODO: nekako hendlat neki emit il nesto
      return;
    }

    const gameData = this.gameService.getGameByToken(token, client.id);
    if (!gameData) {
      return;
    }
    const { gameId, gameObject: game } = gameData;
    await client.join(gameId);
    this.server
      .to(client.id)
      .emit('reconnect', { gameId, game: game.serialize() });
  }
  handleDisconnect(client: Socket) {
    console.log('CLIENT DISCONNECT FIRED', client.id);
    // const rooms = this.server.sockets.adapter.rooms; ALL ROOMS
    const roomName = '1';
    const clients = this.server.sockets.adapter.rooms.get(roomName);

    if (clients) {
      console.log(`Clients in ${roomName}:`, Array.from(clients));
    } else {
      console.log(`Room ${roomName} is empty or does not exist.`);
    }

    //TODO: izbacit ga iz rooma
  }

  @SubscribeMessage('leaveGame')
  handleLeaveGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const cookie = client.handshake.headers.cookie;
    const token = parse(cookie || '')?.accessToken;
    if (!token) {
      return;
    }

    const game = this.gameService.leaveGame(data.gameId, token);
    if (!game) return;
    if (!game.started) {
      this.server.to(data.gameId).emit('playerLeft');
    } else {
      this.server.to(data.gameId).emit('playerLeft', game.serialize());
    }

    console.log('rooms on leavegame', this.server.sockets.adapter.rooms);

    void client.leave(data.gameId);
  }

  @SubscribeMessage('start')
  handleStart(@MessageBody() data: { gameId: string }) {
    const { gameId } = data;

    const game = this.gameService.startGame(gameId, this.server);
    if (!game) {
      console.log(`Game ${gameId} does not exist or is already started`);
      return;
    }

    this.server.to(gameId).emit('gameStart', game.serialize());
    console.log(`GAME ${gameId} STARTED===============================`);
  }

  @SubscribeMessage('hostPrivateGame')
  async handleHostPrivateGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tier: number },
  ) {
    const cookie = client.handshake.headers.cookie;
    const token = parse(cookie || '')?.accessToken;
    if (!token) {
      return;
    }

    const { tier } = data;
    if (typeof tier !== 'number') return;

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

    const result = this.gameService.hostPrivateGame(client.id, tier, token);
    if (!result) {
      console.log('No available game found and failed to create a new one.');
      return;
    }

    const { gameId, game, newPlayer } = result;
    await client.join(gameId);

    this.server.to(gameId).emit('playerJoined', {
      playerId: newPlayer.id,
      gameId: gameId,
      game: game.serialize(),
    });

    if (game.started) {
      this.server.to(gameId).emit('gameStart', game.serialize());
      console.log(
        '=====GAME STARTED=====',
        gameId,
        new Date().toLocaleTimeString('en-GB', { hour12: false }),
      );
      console.log('\nfinal state:');
      game.players.forEach((p) =>
        console.log(
          '-',
          p.walletId.slice(0, 6),
          p.playerType,
          '\n  ',
          'pos: ',
          p.pos,
        ),
      );
    }
  }

  @SubscribeMessage('quickJoin')
  async handleQuickJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tier: number },
  ) {
    const cookie = client.handshake.headers.cookie;
    const token = parse(cookie || '')?.accessToken;

    if (!token) {
      return;
    }

    const { tier } = data;
    if (typeof tier !== 'number') return;

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

    const result = this.gameService.quickJoinGame(client.id, tier, token);

    if (!result) {
      console.log('No available game found and failed to create a new one.');
      return;
    }

    const { gameId, game, newPlayer } = result;

    await client.join(gameId);

    this.server.to(gameId).emit('playerJoined', {
      playerId: newPlayer.id,
      gameId: gameId,
      game: game.serialize(),
    });

    if (game.players.length === MAX_PLAYERS) {
      console.log('fourth player joined, game supposed to be initialized');

      const game = this.gameService.startGame(gameId, this.server);
      if (!game) {
        console.log(`Game ${gameId} does not exist or is already started`);
        return;
      }
      this.server.to(gameId).emit('gameStart', game.serialize());
      console.log(
        '=====GAME STARTED=====',
        gameId,
        new Date().toLocaleTimeString('en-GB', { hour12: false }),
      );
    }
  }

  @SubscribeMessage('joinPrivateGame')
  async handleJoinPrivateGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const cookie = client.handshake.headers.cookie;
    const token = parse(cookie || '')?.accessToken;
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

    const result = this.gameService.joinPrivateGame(client.id, gameId, token);
    if (!result) {
      client.emit('gameFull');
      return;
    }
    const { game, newPlayer } = result;
    await client.join(gameId);
    const availableGames = this.gameService.getAvailableGames();
    this.server.to(gameId).emit('playerJoined', {
      playerId: newPlayer.id,
      gameId: gameId,
      game: game.serialize(),
    });
    this.server.emit('availableGames', availableGames);

    if (game.started) {
      this.server.to(gameId).emit('gameStart', game.serialize());
      console.log(
        '=====GAME STARTED=====',
        gameId,
        new Date().toLocaleTimeString('en-GB', { hour12: false }),
      );
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
    const cookie = client.handshake.headers.cookie;
    const token = parse(cookie || '')?.accessToken;
    if (!token) {
      //TODO: nekako hendlat neki emit il nesto
      return;
    }

    const game = this.gameService.updateGame(data, token, this.server);
    if (!game) return;
  }

  // @SubscribeMessage('restartGame')
  // handleRestartGame(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: { gameId: string },
  // ) {
  //   const cookie = client.handshake.headers.cookie;
  //   const token = parse(cookie || '')?.accessToken;
  //   if (!token) {
  //     //TODO: nekako hendlat neki emit il nesto
  //     return;
  //   }
  //   const game = this.gameService.restartGame(client.id, data.gameId, token);

  //   if (!game) return;

  //   this.server.to(data.gameId).emit('gameStart', game.serialize());
  // }
}
