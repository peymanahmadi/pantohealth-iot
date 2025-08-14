import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import { SignalsModule } from '../signals/signals.module';
import { RabbitMQController } from './rabbitmq.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { XRaySchema } from '../signals/signals.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'XRay', schema: XRaySchema }]),
    SignalsModule,
    ConfigModule,
  ],
  controllers: [RabbitMQController],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
