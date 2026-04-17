import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (origin, callback) => {
      // Barcha kelayotgan manzil (Origin) larni qabul qilish (Ham LAN, ham localhost uchun)
      callback(null, true);
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = parseInt(process.env.PORT || '3000', 10);
  const server = app.getHttpServer();
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} band! 5 soniyadan keyin urinib ko'riladi...`);
      setTimeout(() => server.listen(port, '0.0.0.0'), 5000);
    }
  });
  await app.listen(port, '0.0.0.0');
  console.log(`Backend ishlayapti: http://localhost:${port}/api`);
}
bootstrap();
