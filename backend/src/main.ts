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
    credentials: true 
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(3000, '0.0.0.0');
  console.log('Backend ishlayapti: http://localhost:3000/api');
}
bootstrap();
