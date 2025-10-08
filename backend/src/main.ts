import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS para el frontend
  const origins =
    process.env.FRONTEND_ORIGIN?.split(',').map((s) => s.trim()) ?? true;
  app.enableCors({ origin: origins, credentials: true });

  // Prefijo global de API
  app.setGlobalPrefix('api');

  // Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`Backend funcionando...!! http://localhost:${port}/api`);
}
bootstrap();
