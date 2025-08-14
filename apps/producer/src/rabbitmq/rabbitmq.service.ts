import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { getRabbitMQConfig } from '@pantohealth/config';
import { XRayMessageDto } from '@pantohealth/dtos';

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

  async sendXRayData(data: XRayMessageDto) {
    try {
      await this.client.emit('x-ray', data).toPromise();
      this.logger.log('Sent x-ray data to queue');
    } catch (error) {
      this.logger.error(`Error sending x-ray data: ${error.message}`);
      throw error;
    }
  }
}
