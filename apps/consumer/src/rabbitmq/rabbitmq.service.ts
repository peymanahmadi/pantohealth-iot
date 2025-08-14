import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { getRabbitMQConfig } from '@pantohealth/config/rabbitmq.config';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);
  private client: ClientProxy;

  constructor(private readonly configService: ConfigService) {
    this.client = ClientProxyFactory.create(getRabbitMQConfig(configService));
  }

  async onModuleInit() {
    await this.client.connect();
    this.logger.log('Connected to RabbitMQ');
  }

  async onModuleDestroy() {
    await this.client.close();
    this.logger.log('Disconnected from RabbitMQ');
  }

  // Method to send messages (useful for producer app or future extensions)
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
