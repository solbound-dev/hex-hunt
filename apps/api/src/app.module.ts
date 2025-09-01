import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ...(process.env.NODE_ENV !== 'dev'
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '../..', 'web', 'dist'),
          }),
        ]
      : []),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
