import { Module } from '@nestjs/common';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { SignalsModule } from './signals/signals.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(
          'MONGO_URL',
          'mongodb://localhost:27017/pantohealth',
        ),
      }),
      inject: [ConfigService],
    }),
    RabbitMQModule,
    SignalsModule,
  ],
})
export class AppModule {}
