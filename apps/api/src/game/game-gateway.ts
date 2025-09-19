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
  GameData,
  generateGrid,
  getAvailablePlayerPos,
  isInGrid,
  isNeighbor,
  isSameMove,
  Player,
  PlayerType,
  shootInDirection,
  spawnCard,
  updateAndEmitGameState,
} from './game-utils';
import { Hex } from './Hex';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private games: Record<string, GameData> = {};
  private moves: number = 0;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
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
        grid: generateGrid(3),
        disappearedHexes: [] as Hex[],
        warningHexes: [] as Hex[],
        moves: 0,
        cardPos: null,
        currentRadius: 3,
        players: [],
      } as GameData;
    }

    const game = this.games[gameId];

    if (game.players.length >= 2) {
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
      // return;
    }
    //do the same for robot and drone

    game.cardPos = spawnCard(game);
    this.server.to(gameId).emit('gameStart', this.games[gameId]);
    console.log('GAME STARTED===============================');
    game.players.forEach((p) => (p.pendingMove = null));

    // if (
    //   this.games[gameId].alienId !== null &&
    //   this.games[gameId].astronautId !== null
    // ) {
    //   // Reject third player
    //   client.emit('gameFull');
    //   console.log('GAME FULL');
    //   return;
    // }
    // let didInsertAstronaut = false;
    // if (
    //   this.games[gameId].alienId === null &&
    //   this.games[gameId].astronautId === null
    // ) {
    //   await client.join(gameId);
    //   this.games[gameId].astronautId = client.id;
    //   this.games[gameId].astronautPos =
    //     this.games[gameId].grid[
    //       Math.floor(Math.random() * this.games[gameId].grid.length)
    //     ];
    //   this.games[gameId].lastSeenAstronautPos = this.games[gameId].astronautPos;
    //   didInsertAstronaut = true;
    //   console.log(`Client ${client.id} joined game ${gameId}`);
    //   this.server.to(gameId).emit('playerJoined', { playerId: client.id });
    // }

    // //add alien if astronaut is already in game
    // if (
    //   !didInsertAstronaut &&
    //   this.games[gameId].alienId === null &&
    //   this.games[gameId].astronautId !== client.id
    // ) {
    //   this.games[gameId].alienId = client.id;
    //   this.games[gameId].alienPos = getAlienPos(
    //     this.games[gameId].astronautPos,
    //     this.games[gameId].grid,
    //   );
    //   this.games[gameId].lastSeenAlienPos = this.games[gameId].alienPos;
    //   await client.join(gameId);
    //   console.log(`Client ${client.id} joined game ${gameId}`);
    //   this.server.to(gameId).emit('playerJoined', { playerId: client.id });
    // }
    // // Start game when 2 players are present
    // if (
    //   this.games[gameId].astronautId !== null &&
    //   this.games[gameId].alienId !== null
    // ) {
    //   this.games[gameId].cardPos = spawnCard(this.games[gameId]);

    //   console.log('GAME STARTED');
    //   this.server.to(gameId).emit('gameStart', this.games[gameId]);
    //   this.games[gameId].astronautPendingMove = null;
    //   this.games[gameId].alienPendingMove = null;
    // }
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
    game.players.forEach((p) => {
      if (client.id === p.id) {
        if (p.isShooting === null) {
          p.isShooting = data.isShooting;
        }
        if (p.pendingMove === null) {
          if (isSameMove(data.move, p.pos)) return;
          if (!isNeighbor(data.move, p.pos)) return;
        }
        p.pendingMove = new Hex(data.move.q, data.move.r);
      }
    });

    game.players.forEach((p) => (p.justPickedCard = false));

    //   //emit if both moves have been made
    const waitingForMoves = game.players.some((p) => p.pendingMove === null);
    if (!waitingForMoves) {
      game.players.forEach((p) => {
        if (p.isShooting) {
          p.lastSeenPos = p.pos;
          shootInDirection(p.pendingMove!, game, p);
        }
      });
      //COLLISION CHECK
      //TODO: triba za svakog gledat je li se s ikin sudarija i ako je
      //ne dat mu da se makne (valjda ne triba oba ogranicit)
      //jer ce se taj drugi kad budemo za njega gledali

      //pomaknit ih ako ne pucaju
      game.players.forEach((p) => {
        if (!p.isShooting) {
          p.pos = new Hex(p.pendingMove!.q, p.pendingMove!.r);
        }
      });

      //TODO: vidit jesu li skupili karticu

      updateAndEmitGameState(data.gameId, game, this.server);
    }
  }
}

//   if (client.id === game.astronautId) {
//     if (game.isAstronautShooting === null) {
//       game.isAstronautShooting = data.isShooting;
//     }
//     if (game.astronautPendingMove === null) {
//       if (isSameMove(data.move, game.astronautPos)) {
//         return;
//       }
//       if (!isNeighbor(data.move, game.astronautPos)) {
//         return;
//       }
//       game.astronautPendingMove = data.move;
//     }
//   }
//   if (client.id === game.alienId) {
//     if (game.isAlienShooting === null) {
//       game.isAlienShooting = data.isShooting;
//     }
//     if (game.alienPendingMove === null) {
//       if (isSameMove(data.move, game.alienPos)) {
//         return;
//       }
//       if (!isNeighbor(data.move, game.alienPos)) {
//         return;
//       }
//       game.alienPendingMove = data.move;
//     }
//   }
//   game.astronautJustPickedCard = false;
//   game.alienJustPickedCard = false;
//   if (game.astronautPendingMove !== null && game.alienPendingMove !== null) {
//     //SHOOTING CHECK
//     if (game.isAstronautShooting) {
//       game.lastSeenAstronautPos = game.astronautPos;
//       shootInDirection(game.astronautPendingMove, game, 'astronaut');
//     }
//     if (game.isAlienShooting) {
//       game.lastSeenAlienPos = game.alienPos;
//       shootInDirection(game.alienPendingMove, game, 'alien');
//     }
//     if (didCollide(game)) {
//       game.lastSeenAstronautPos = game.astronautPendingMove;
//       game.lastSeenAlienPos = game.alienPendingMove;
//       updateAndEmitGameState(data.gameId, game, this.server);
//       return;
//     }
//     if (!game.isAstronautShooting) {
//       game.astronautPos = new Hex(
//         game.astronautPendingMove.q,
//         game.astronautPendingMove.r,
//       );
//     }
//     if (!game.isAlienShooting) {
//       game.alienPos = new Hex(
//         game.alienPendingMove.q,
//         game.alienPendingMove.r,
//       );
//     }
//     if (didAstronautCollectCard(game)) {
//       if (game.astronautCards < 3) {
//         const nextCardPos = spawnCard(game);
//         game.lastSeenAstronautPos = game.cardPos;
//         game.cardPos = nextCardPos;
//         game.astronautCards++;
//         game.astronautJustPickedCard = true;
//         game.isAstronautImmune = true;
//       }
//       //maybe we want to put game.cardPos = nextCardPos; here
//     }
//     if (didAlienCollectCard(game)) {
//       if (game.alienCards < 3) {
//         const nextCardPos = spawnCard(game);
//         game.lastSeenAlienPos = game.cardPos;
//         game.cardPos = nextCardPos;
//         game.alienCards++;
//         game.alienJustPickedCard = true;
//         game.isAlienImmune = true;
//       }
//     }
//     this.moves++;
//     updateAndEmitGameState(data.gameId, game, this.server);
//   }
