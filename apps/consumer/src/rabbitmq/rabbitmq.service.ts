import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);
  private client: ClientProxy;

  constructor(private readonly configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          this.configService.get<string>(
            'RABBITMQ_URL',
            'amqp://localhost:5672',
          ),
        ],
        queue: configService.get<string>('RABBITMQ_QUEUE', 'x-ray'),
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async onModuleInit() {
    await this.client.connect();
    this.logger.log('Connected to RabbitMQ');
  }

  async onModuleDestroy() {
    await this.client.close();
    this.logger.log('Disconnected from RabbitMQ');
  }

  async sendMessage(pattern: string, data: any) {
    try {
      await this.client.emit(pattern, data).toPromise();
      this.logger.log(`Sent message to pattern: ${pattern}`);
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      throw error;
    }
  }
}
