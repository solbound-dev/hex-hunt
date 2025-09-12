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
  contractZone,
  didAlienCollectCard,
  didAlienGetShot,
  didAstronautCollectCard,
  didAstronautGetShot,
  didCollide,
  GameData,
  generateGrid,
  isInGrid,
  isNeighbor,
  isSameMove,
  spawnCard,
} from './game-utils';
import { Hex } from './Hex';

function getAlienPos(astronautPos: Hex, grid: Hex[]) {
  let alienPos = astronautPos;
  do {
    alienPos = grid[Math.floor(Math.random() * grid.length)];
  } while (
    astronautPos.distanceTo(alienPos) < 3 ||
    astronautPos.equals(alienPos)
  );

  return alienPos;
}

@WebSocketGateway(3005, { cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private games: Record<string, GameData> = {};
  private moves: number = 0;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    console.log('games', this.games);
  }
  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
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
        astronautId: null,
        alienId: null,
        lastSeenAstronautPos: null,
        lastSeenAlienPos: null,
        grid: generateGrid(3),
        disappearedHexes: [] as Hex[],
        moves: 0,
        astronautPos: null,
        alienPos: null,
        cardPos: null,
        astronautCards: 0,
        alienCards: 0,
        astronautPendingMove: null,
        alienPendingMove: null,
        isAstronautShooting: null,
        isAlienShooting: null,
        currentRadius: 3,
      } as GameData;
    }
    //add astronaut if there is nobody in game
    if (
      this.games[gameId].alienId !== null &&
      this.games[gameId].astronautId !== null
    ) {
      // Reject third player
      client.emit('gameFull');
      console.log('GAME FULL');
      return;
    }
    let didInsertAstronaut = false;
    if (
      this.games[gameId].alienId === null &&
      this.games[gameId].astronautId === null
    ) {
      await client.join(gameId);
      this.games[gameId].astronautId = client.id;
      this.games[gameId].astronautPos =
        this.games[gameId].grid[
          Math.floor(Math.random() * this.games[gameId].grid.length)
        ];
      this.games[gameId].lastSeenAstronautPos = this.games[gameId].astronautPos;
      didInsertAstronaut = true;
      console.log(`Client ${client.id} joined game ${gameId}`);
      this.server.to(gameId).emit('playerJoined', { playerId: client.id });
    }

    //add alien if astronaut is already in game
    if (
      !didInsertAstronaut &&
      this.games[gameId].alienId === null &&
      this.games[gameId].astronautId !== client.id
    ) {
      this.games[gameId].alienId = client.id;
      this.games[gameId].alienPos = getAlienPos(
        this.games[gameId].astronautPos!,
        this.games[gameId].grid,
      );
      this.games[gameId].lastSeenAlienPos = this.games[gameId].alienPos;
      await client.join(gameId);
      console.log(`Client ${client.id} joined game ${gameId}`);
      this.server.to(gameId).emit('playerJoined', { playerId: client.id });
    }
    // Start game when 2 players are present
    if (
      this.games[gameId].astronautId !== null &&
      this.games[gameId].alienId !== null
    ) {
      this.games[gameId].cardPos = spawnCard(this.games[gameId]);

      console.log('GAME STARTED');
      this.server.to(gameId).emit('gameStart', this.games[gameId]);
      this.games[gameId].astronautPendingMove = null;
      this.games[gameId].alienPendingMove = null;
    }
  }

  // Broadcast a game state update to only players in that room
  @SubscribeMessage('updateGame')
  handleUpdateGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; move: Hex; isShooting: boolean },
  ) {
    const game = this.games[data.gameId];
    if (!isInGrid(data.move, game.grid, game.disappearedHexes)) {
      return;
    }
    if (client.id === game.astronautId) {
      if (game.isAstronautShooting === null) {
        game.isAstronautShooting = data.isShooting;
      }

      if (game.astronautPendingMove === null) {
        if (isSameMove(data.move, game.astronautPos)) {
          return;
        }
        if (!isNeighbor(data.move, game.astronautPos)) {
          return;
        }
        game.astronautPendingMove = data.move;
      }
    }
    if (client.id === game.alienId) {
      if (game.isAlienShooting === null) {
        game.isAlienShooting = data.isShooting;
      }

      if (game.alienPendingMove === null) {
        if (isSameMove(data.move, game.alienPos)) {
          return;
        }
        if (!isNeighbor(data.move, game.alienPos)) {
          return;
        }
        game.alienPendingMove = data.move;
      }
    }

    //emit if both moves have been made
    if (game.astronautPendingMove !== null && game.alienPendingMove !== null) {
      //shooting
      if (game.isAstronautShooting) {
        game.lastSeenAstronautPos = game.astronautPos;
        if (didAlienGetShot(game)) {
          console.log('Alien got shot');
          game.isAlienDead = true;
        }
      }
      if (game.isAlienShooting) {
        game.lastSeenAlienPos = game.alienPos;
        if (didAstronautGetShot(game)) {
          console.log('Astronaut got shot');
          game.isAstronautDead = true;
        }
      }

      //not shooting
      if (didCollide(game)) {
        console.log('collision');
        game.lastSeenAstronautPos = game.astronautPendingMove;
        game.lastSeenAlienPos = game.alienPendingMove;
        game.astronautPendingMove = null;
        game.alienPendingMove = null;
        this.server.to(data.gameId).emit('gameState', game);
        return;
      }

      if (!game.isAstronautShooting) {
        game.astronautPos = game.astronautPendingMove;
      }
      if (!game.isAlienShooting) {
        game.alienPos = game.alienPendingMove;
      }

      if (didAstronautCollectCard(game)) {
        const nextCardPos = spawnCard(game);
        game.lastSeenAstronautPos = game.cardPos;
        game.cardPos = nextCardPos;
        game.astronautCards++;
      }

      if (didAlienCollectCard(game)) {
        const nextCardPos = spawnCard(game);
        game.lastSeenAlienPos = game.cardPos;
        game.cardPos = nextCardPos;
        game.alienCards++;
      }

      //reset and emit
      this.moves++;

      if ((game.moves + 1) % 4 === 0) {
        game.currentRadius--;
        game.disappearedHexes = contractZone(game.currentRadius, game.grid);
      }

      if (
        game.disappearedHexes.some(
          (hex) =>
            hex.q === game.astronautPos?.q && hex.r === game.astronautPos.r,
        )
      ) {
        game.isAstronautDead = true;
      }
      if (
        game.disappearedHexes.some(
          (hex) => hex.q === game.alienPos?.q && hex.r === game.alienPos.r,
        )
      ) {
        console.log('alien died');
        game.isAlienDead = true;
      }
      this.server.to(data.gameId).emit('gameState', game);
      game.moves++;
      game.astronautPendingMove = null;
      game.alienPendingMove = null;
      game.isAstronautShooting = null;
      game.isAlienShooting = null;
    }
  }
}
