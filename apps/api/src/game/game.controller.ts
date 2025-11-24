import { Controller, Get, Param } from '@nestjs/common';
import { GameService } from './game.service';
import { Game } from './Game';

@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get()
    getGames() {
        console.log('getGames controller');
        return this.gameService.getAvailableGames();
    }

    @Get(':id')
    getGame(@Param('id') id: string): Game | undefined {
        return this.gameService.getGame(id);
    }
}
