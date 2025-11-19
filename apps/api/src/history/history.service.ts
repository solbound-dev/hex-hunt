import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HistoryPlayer, HistoryTurn } from './history.dto';
import { Game } from 'src/game/Game';

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

  getTurnByNumber(gameId: string, turnNumber: number) {
    return this.prisma.turn.findFirst({
      where: {
        gameId: gameId,
        turnNumber: turnNumber,
      },
    });
  }

  addTurn(turn: HistoryTurn) {
    return this.prisma.turn.create({
      data: {
        gameId: turn.gameId,
        turnNumber: turn.turnNumber,
        cardPosQ: turn.cardPos.q,
        cardPosR: turn.cardPos.r,
      },
    });
  }

  async writePendingMoves(turnId: number, gameId: string, game: Game) {
    const gamePlayers = await this.prisma.gamePlayer.findMany({
      where: {
        gameId: gameId,
      },
    });

    console.log('gp', gamePlayers);

    const gamePlayerTurns = gamePlayers.map((gp) => {
      const player = game.players.find((p) => p.walletId === gp.playerId);
      if (!player) {
        throw new Error(`Player with id ${gp.playerId} not found in game.`);
      }

      return {
        gamePlayerId: gp.id,
        pendingQ: player.pendingMove ? player.pendingMove.q : null,
        pendingR: player.pendingMove ? player.pendingMove.r : null,
        isShooting: player.isShooting,
        turnId: turnId,
      };
    });

    console.log('gpt', gamePlayerTurns);

    return this.prisma.gamePlayerTurn.createMany({
      data: gamePlayerTurns,
    });
  }

  updateCardPos() {}

  //when a player leaves a game but the game hasn't started yet
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removePlayerFromGame(gameId: string, playerId: string) {}
}
