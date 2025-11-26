import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) {}

    @Get(':gameId')
    getHistoryForGame(@Param('gameId') gameId: string) {
        return this.historyService.getHistoryForGame(gameId);
    }

    @Get(':gameId/turns/:turnNumber')
    async getResolvedTurnGameStateByNumber(
        @Param('gameId') gameId: string,
        @Param('turnNumber', ParseIntPipe) turnNumber: number,
    ) {
        const result = await this.historyService.getResolvedTurnGameState(
            gameId,
            turnNumber,
        );

        if (result instanceof Error) {
            throw new HttpException(result.message, HttpStatus.NOT_FOUND);
        }

        return this.historyService.getResolvedTurnGameState(gameId, turnNumber);
    }

    @Get(':gameId/max-turn-number')
    getNumberOfTurnsInGame(@Param('gameId') gameId: string) {
        return this.historyService.getMaxTurnNumber(gameId);
    }
}
