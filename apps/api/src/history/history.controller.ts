import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) {}

    @Get(':gameId')
    getHistoryForGame(@Param('gameId') gameId: string) {
        return this.historyService.getHistoryForGame(gameId);
    }

    @Get(':gameId/turns/:turnNumber')
    getResolvedTurnGameStateByNumber(
        @Param('gameId') gameId: string,
        @Param('turnNumber', ParseIntPipe) turnNumber: number,
    ) {
        return this.historyService.getResolvedTurnGameState(gameId, turnNumber);
    }

    @Get(':gameId/max-turn-number')
    getNumberOfTurnsInGame(@Param('gameId') gameId: string) {
        return this.historyService.getMaxTurnNumber(gameId);
    }
}
