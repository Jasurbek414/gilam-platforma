import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global API prefix — barcha route: /api/...
  app.setGlobalPrefix('api');

  // CORS — frontenddan so'rov qabul qilish
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
  });

  // Global Validation — barcha DTO avtomatik tekshiriladi
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // DTO da yo'q fieldlarni olib tashlaydi
      forbidNonWhitelisted: true, // Noma'lum field yuborilsa xato beradi
      transform: true,        // Tiplarni avtomatik convert qiladi
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Backend ishlayapti: http://localhost:${port}/api`);
}
bootstrap();
