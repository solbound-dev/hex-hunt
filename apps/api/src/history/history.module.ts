import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { HistoryController } from './history.controller';

@Module({
  imports: [PrismaModule],
  providers: [HistoryService, PrismaService],
  controllers: [HistoryController],
  exports: [HistoryService],
})
export class HistoryModule {}
