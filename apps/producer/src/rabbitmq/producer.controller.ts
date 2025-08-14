import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { XRayMessageDto } from '@pantohealth/dtos';
import { SampleDataService } from '../sample-data/sample-data.service';

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
    // const sampleData: XRayMessageDto = {
    //   deviceId: `device-${Math.random().toString(36).substring(2, 15)}`,
    //   time: Date.now(),
    //   data: [
    //     {
    //       time: Date.now(),
    //       coordinatesAndSpeed: [
    //         Math.random() * 100,
    //         Math.random() * 100,
    //         Math.random() * 50,
    //       ],
    //     },
    //     {
    //       time: Date.now() + 1000,
    //       coordinatesAndSpeed: [
    //         Math.random() * 100,
    //         Math.random() * 100,
    //         Math.random() * 50,
    //       ],
    //     },
    //   ],
    // };
    await this.rabbitMQService.sendXRayData(sampleData);
    return { message: 'Sample x-ray data sent to queue', data: sampleData };
  }
}
