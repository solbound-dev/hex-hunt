import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HistoryPlayer } from './history.dto';

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

  addTurn() {}

  writePlayerPendingMove() {}

  updateCardPos() {}
}
