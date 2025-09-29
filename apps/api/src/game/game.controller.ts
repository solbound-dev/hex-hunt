import { Controller, Get, Param } from '@nestjs/common';
import { GameService } from './game.service';
import { Game } from './Game';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  getGames(): Game[] {
    return this.gameService.getGames();
  }

  @Get(':id')
  getGame(@Param('id') id: string): Game | undefined {
    return this.gameService.getGame(id);
  }
}
