import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HistoryPlayer, HistoryTurn } from './history.dto';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  createGame() {
    return this.prisma.game.create({
      data: {
        createdAt: new Date(),
      },
    });
  }

  addPlayerToGame(gameId: string, player: HistoryPlayer) {
    return this.prisma.gamePlayer.upsert({
      where: {
        gameId_playerId: {
          gameId: gameId,
          playerId: player.playerId,
        },
      },
      update: {
        playerType: player.playerType,
        initialQ: player.initialPos.q,
        initialR: player.initialPos.r,
      },
      create: {
        gameId: gameId,
        playerId: player.playerId,
        playerType: player.playerType,
        initialQ: player.initialPos.q,
        initialR: player.initialPos.r,
      },
    });
  }

  addTurn(turn: HistoryTurn) {
    console.log('addturn', turn.turnNumber, turn.cardPos);

    return this.prisma.turn.create({
      data: {
        gameId: turn.gameId,
        turnNumber: turn.turnNumber,
        cardPosQ: turn.cardPos.q,
        cardPosR: turn.cardPos.r,
      },
    });
  }

  writePlayerPendingMove() {}

  updateCardPos() {}

  //when a player leaves a game but the game hasn't started yet
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removePlayerFromGame(gameId: string, playerId: string) {}
}
