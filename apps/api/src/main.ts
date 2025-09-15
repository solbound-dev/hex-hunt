import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter';
// import { Server } from 'http';

// let server: Server;

// async function bootstrapServer() {
//   const app = await NestFactory.create(AppModule);
//   await app.init();
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
//   return app.getHttpAdapter().getInstance();
// }

// /**
//  * Vercel serverless handler
//  */
// export default async function handler(req: any, res: any) {
//   if (!server) {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//     server = await bootstrapServer();
//   }
//   server.emit('request', req, res);
// }

const setupFilter = (app: INestApplication) => {
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  setupFilter(app);

  const port = process.env.PORT ?? 3000;
  if (process.env.NODE_ENV === 'production') {
    app.listen(port, "0.0.0.0");
  } else {
    app.listen(port);
  }
}

void bootstrap();
