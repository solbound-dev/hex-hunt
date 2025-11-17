import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  providers: [HistoryService, PrismaService],
  exports: [HistoryService],
})
export class HistoryModule {}
