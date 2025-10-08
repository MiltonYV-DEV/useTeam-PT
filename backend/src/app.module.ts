import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Cargar variables de entonrno desde .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Conexcion a MongoDB usando la variable del .env
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
  ],

  // Controladores globales
  controllers: [HealthController],
})
export class AppModule {}
