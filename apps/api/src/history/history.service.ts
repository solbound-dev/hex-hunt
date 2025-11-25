import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HistoryPlayer, HistoryTurn } from './history.dto';
import { Game } from 'src/game/Game';
import { Player, PlayerType } from 'src/game/Player';
import { Hex } from 'src/game/Hex';

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

    addResolvedTurn(turn: HistoryTurn) {
        return this.prisma.turnResolved.create({
            data: {
                gameId: turn.gameId,
                turnNumber: turn.turnNumber,
                cardPosQ: turn.cardPos.q,
                cardPosR: turn.cardPos.r,
            },
        });
    }

    async writeResolvedTurns(
        turnResolvedId: number,
        gameId: string,
        game: Game,
    ) {
        const gamePlayers = await this.prisma.gamePlayer.findMany({
            where: {
                gameId: gameId,
            },
        });

        const gamePlayerResolvedTurns = gamePlayers.map((gp) => {
            const player = game.players.find((p) => p.walletId === gp.playerId);
            if (!player) {
                throw new Error(
                    `Player with id ${gp.playerId} not found in game.`,
                );
            }

            return {
                gamePlayerId: gp.id,
                posQ: player.pos.q,
                posR: player.pos.r,
                lastSeenPosQ: player.lastSeenPos.q,
                lastSeenPosR: player.lastSeenPos.r,
                previousPosQ: player.previousPos ? player.previousPos.q : null,
                previousPosR: player.previousPos ? player.previousPos.r : null,
                won: player.won,
                cards: player.cards,
                isDead: player.isDead,
                isImmune: player.isImmune,
                diedAtMove: player.diedAtMove,
                lastBulletQ: player.lastBulletHex
                    ? player.lastBulletHex.q
                    : null,
                lastBulletR: player.lastBulletHex
                    ? player.lastBulletHex.r
                    : null,
                turnResolvedId: turnResolvedId,
            };
        });

        return this.prisma.gamePlayerTurnResolved.createMany({
            data: gamePlayerResolvedTurns,
        });
    }

    async writePendingMoves(turnId: number, gameId: string, game: Game) {
        const gamePlayers = await this.prisma.gamePlayer.findMany({
            where: {
                gameId: gameId,
            },
        });

        const gamePlayerTurns = gamePlayers.map((gp) => {
            const player = game.players.find((p) => p.walletId === gp.playerId);
            if (!player) {
                throw new Error(
                    `Player with id ${gp.playerId} not found in game.`,
                );
            }

            return {
                gamePlayerId: gp.id,
                pendingQ: player.pendingMove ? player.pendingMove.q : null,
                pendingR: player.pendingMove ? player.pendingMove.r : null,
                isShooting: player.isShooting,
                turnId: turnId,
            };
        });

        return this.prisma.gamePlayerTurn.createMany({
            data: gamePlayerTurns,
        });
    }

    getGamePlayer() {}

    getHistoryForGame(gameId: string) {
        return this.prisma.game.findUnique({
            where: {
                id: gameId,
            },
            include: {
                gamePlayers: true,
                turns: {
                    include: {
                        gamePlayerTurns: true,
                    },
                    orderBy: { turnNumber: 'asc' },
                },
            },
        });
    }

    async getResolvedTurnGameState(gameId: string, turnNumber: number) {
        const gameState = new Game(0, false);
        gameState.moves = turnNumber;

        const gamePlayers = await this.prisma.gamePlayer.findMany({
            where: {
                gameId: gameId,
            },
        });

        const turn = await this.prisma.turnResolved.findFirst({
            where: {
                gameId: gameId,
                turnNumber: turnNumber,
            },
            include: {
                gamePlayerTurnsResolved: true,
            },
        });

        if (!turn) {
            throw new Error(
                `Resolved turn ${turnNumber} for game ${gameId} not found.`,
            );
        }

        gameState.cardPos = new Hex(turn.cardPosQ, turn.cardPosR);
        gameState.started = true;

        turn.gamePlayerTurnsResolved.forEach((gptr) => {
            const gp = gamePlayers.find((gp) => gp.id === gptr.gamePlayerId);
            if (!gp) {
                throw new Error(
                    `Game player with id ${gptr.gamePlayerId} not found.`,
                );
            }

            const pos = new Hex(gptr.posQ, gptr.posR);
            const lastSeenPos = new Hex(gptr.lastSeenPosQ, gptr.lastSeenPosR);
            const previousPos =
                gptr.previousPosQ !== null && gptr.previousPosR !== null
                    ? new Hex(gptr.previousPosQ, gptr.previousPosR)
                    : null;

            const player = new Player(
                gp.playerType as PlayerType,
                '',
                gp.playerId,
                pos,
                lastSeenPos,
                previousPos,
                gptr.won,
                0,
                gptr.cards,
                null,
                gptr.isDead,
                false,
                null,
                gptr.isImmune,
                false,
                gptr.diedAtMove,
                gptr.lastBulletQ !== null && gptr.lastBulletR !== null
                    ? new Hex(gptr.lastBulletQ, gptr.lastBulletR)
                    : null,
            );

            gameState.players.push(player);
        });

        return gameState;
    }

    getNumberOfTurns(gameId: string) {
        return this.prisma.turnResolved.count({
            where: {
                gameId: gameId,
            },
        });
    }

    //when a player leaves a game but the game hasn't started yet
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removePlayerFromGame(gameId: string, playerId: string) {}
}
