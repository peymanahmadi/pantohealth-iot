import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import { ProducerController } from './producer.controller';
import { SampleDataService } from '../sample-data/sample-data.service';

@Module({
  imports: [ConfigModule],
  controllers: [ProducerController],
  providers: [RabbitMQService, SampleDataService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
