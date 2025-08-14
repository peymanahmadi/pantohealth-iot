import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { SignalsService } from '../signals/signals.service';
import { XRayMessageDto } from '@pantohealth/dtos';

@Controller()
export class RabbitMQController {
  private readonly logger = new Logger(RabbitMQController.name);

  constructor(private readonly signalsService: SignalsService) {}

  @MessagePattern('x-ray')
  async handleXRayMessage(@Payload() message: any, @Ctx() context: RmqContext) {
    try {
      const dto = plainToClass(XRayMessageDto, message);
      const errors = await validate(dto);
      if (errors.length > 0) {
        this.logger.error(`Invalid message: ${JSON.stringify(errors)}`);
        return;
      }

      // Process and save the message
      await this.signalsService.create(dto);
      this.logger.log(`Processed message for deviceId: ${dto.deviceId}`);

      // Acknowledge the message
      // const channel = context.getChannelRef();
      // const originalMsg = context.getMessage();
      // channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);
    }
  }
}
