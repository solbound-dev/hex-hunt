import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { HistoryModule } from 'src/history/history.module';

@Module({
  providers: [GameGateway, GameService],
  imports: [HistoryModule],
  exports: [GameService],
  controllers: [GameController],
})
export class GameModule {}
