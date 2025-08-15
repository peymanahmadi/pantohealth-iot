import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { SampleDataService } from '../sample-data/sample-data.service'
import { XRayMessageDto } from '../dtos/xray-message.dto';

@Controller('producer')
@ApiTags('Producer')
export class ProducerController {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly sampleDataService: SampleDataService,
  ) {}

  @Post('send-xray')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: XRayMessageDto })
  @ApiResponse({ status: 200, description: 'X-ray data sent to queue' })
  async sendXRayData(@Body() data: XRayMessageDto) {
    await this.rabbitMQService.sendXRayData(data);
    return { message: 'X-ray data sent to queue' };
  }

  @Post('send-sample-xray')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Sample x-ray data sent to queue' })
  async sendSampleXRayData() {
    const sampleData = this.sampleDataService.generateSampleXRayData();
    await this.rabbitMQService.sendXRayData(sampleData);
    return { message: 'Sample x-ray data sent to queue', data: sampleData };
  }
}
