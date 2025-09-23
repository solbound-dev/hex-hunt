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
  checkCollisionAndUpdate,
  checkDidPlayerCollectCardAndUpdate,
  GameData,
  generateGrid,
  getAvailablePlayerPos,
  isInGrid,
  isNeighbor,
  isSameMove,
  MAX_PLAYERS,
  Player,
  PlayerType,
  shootInDirection,
  spawnCard,
  START_GRID_RADIUS,
  updateAndEmitGameState,
} from './game-utils';
import { Hex } from './Hex';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private games: Record<string, GameData> = {};

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

    game.cardPos = spawnCard(game);
    this.server.to(gameId).emit('gameStart', this.games[gameId]);
    console.log('GAME STARTED===============================');
    game.players.forEach((p) => (p.pendingMove = null));
  }

  // A player joins a game room
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
      this.games[gameId] = {
        grid: generateGrid(START_GRID_RADIUS),
        disappearedHexes: [] as Hex[],
        warningHexes: [] as Hex[],
        moves: 0,
        cardPos: null,
        currentRadius: START_GRID_RADIUS,
        started: false,
        players: [],
      } as GameData;
    }

    const game = this.games[gameId];

    if (game.players.length >= MAX_PLAYERS || game.started) {
      client.emit('gameFull');
      return;
    }

    if (
      !game.players.some((player) => player.playerType === PlayerType.Astronaut)
    ) {
      await client.join(gameId);
      const newPlayer = new Player(PlayerType.Astronaut);
      newPlayer.pos = getAvailablePlayerPos(game.players, game.grid);
      newPlayer.id = client.id;
      newPlayer.lastSeenPos = newPlayer.pos;
      game.players.push(newPlayer);
      this.server.to(gameId).emit('playerJoined', { playerId: client.id });
      return;
    }
    if (
      !game.players.some((player) => player.playerType === PlayerType.Alien)
    ) {
      await client.join(gameId);
      const newPlayer = new Player(PlayerType.Alien);
      newPlayer.pos = getAvailablePlayerPos(game.players, game.grid);
      newPlayer.id = client.id;
      newPlayer.lastSeenPos = newPlayer.pos;
      game.players.push(newPlayer);
      this.server.to(gameId).emit('playerJoined', { playerId: client.id });
      return;
    }
    //do the same for robot and wizard
    if (
      !game.players.some((player) => player.playerType === PlayerType.Robot)
    ) {
      await client.join(gameId);
      const newPlayer = new Player(PlayerType.Robot);
      newPlayer.pos = getAvailablePlayerPos(game.players, game.grid);
      newPlayer.id = client.id;
      newPlayer.lastSeenPos = newPlayer.pos;
      game.players.push(newPlayer);
      this.server.to(gameId).emit('playerJoined', { playerId: client.id });
      return;
    }
    if (
      !game.players.some((player) => player.playerType === PlayerType.Wizard)
    ) {
      await client.join(gameId);
      const newPlayer = new Player(PlayerType.Wizard);
      newPlayer.pos = getAvailablePlayerPos(game.players, game.grid);
      newPlayer.id = client.id;
      newPlayer.lastSeenPos = newPlayer.pos;
      game.players.push(newPlayer);
      this.server.to(gameId).emit('playerJoined', { playerId: client.id });
    }

    game.cardPos = spawnCard(game);
    this.server.to(gameId).emit('gameStart', this.games[gameId]);
    console.log('GAME STARTED===============================');
    game.players.forEach((p) => (p.pendingMove = null));
  }

  // Broadcast a game state update to only players in that room
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
    console.log('didRunOutOfTime', data.didRunOutOfTime);

    if (data.move) {
      if (!isInGrid(data.move, game.grid, game.disappearedHexes)) {
        return;
      }
    }

    game.players.forEach((p) => {
      if (client.id === p.id) {
        if (data.didRunOutOfTime) {
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
            if (isSameMove(data.move, p.pos)) return;
            if (!isNeighbor(data.move, p.pos)) return;
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
          shootInDirection(p.pendingMove!, game, p);
        }
      });

      //collision check
      game.players.forEach((p) => checkCollisionAndUpdate(p, game));

      //move players if the aren't shooting
      game.players.forEach((p) => {
        if (!p.isShooting && !p.didJustCollide && !p.isDead) {
          p.pos = new Hex(p.pendingMove!.q, p.pendingMove!.r);
        }
      });

      //TODO: vidit jesu li skupili karticu
      game.players.forEach((p) => checkDidPlayerCollectCardAndUpdate(p, game));

      updateAndEmitGameState(data.gameId, game, this.server);
    }
  }
}
