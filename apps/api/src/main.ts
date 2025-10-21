import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter';
import * as cookieParser from 'cookie-parser';

const setupFilter = (app: INestApplication) => {
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('api');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3005',
      'http://localhost:5173',
      'https://hextraction.xyz',
    ],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  setupFilter(app);

  const port = process.env.PORT ?? 3000;
  if (process.env.NODE_ENV === 'production') {
    void app.listen(port, '0.0.0.0');
  } else {
    void app.listen(port);
  }
}

void bootstrap();

//force rebuild
//mrzin kompjutere
//
