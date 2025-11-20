import { Controller, Get, Param } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get(':gameId')
  getHistoryForGame(@Param('gameId') gameId: string) {
    return this.historyService.getHistoryForGame(gameId);
  }
}
