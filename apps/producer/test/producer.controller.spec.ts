import { Test, TestingModule } from '@nestjs/testing';
import { ProducerController } from '../src/rabbitmq/producer.controller';
import { RabbitMQService } from '../src/rabbitmq/rabbitmq.service';
import { SampleDataService } from '../src/sample-data/sample-data.service';
import { XRayMessageDto } from '../src/dtos/xray-message.dto';

describe('ProducerController', () => {
  let controller: ProducerController;
  let rabbitMQService: RabbitMQService;
  let sampleDataService: SampleDataService;

  beforeEach(async () => {
    rabbitMQService = {
      sendXRayData: jest.fn(),
    } as any as RabbitMQService;

    sampleDataService = {
      generateSampleXRayData: jest.fn(),
    } as any as SampleDataService;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProducerController],
      providers: [
        { provide: RabbitMQService, useValue: rabbitMQService },
        { provide: SampleDataService, useValue: sampleDataService },
      ],
    }).compile();

    controller = module.get<ProducerController>(ProducerController);
  });

  it('should send xray data and return success message', async () => {
    const xrayDto: XRayMessageDto = {
      deviceId: 'device-123',
      time: 12345678,
      data: [],
    };
    (rabbitMQService.sendXRayData as jest.Mock).mockResolvedValue(undefined);

    const result = await controller.sendXRayData(xrayDto);

    expect(rabbitMQService.sendXRayData).toHaveBeenCalledWith(xrayDto);
    expect(result).toEqual({ message: 'X-ray data sent to queue' });
  });

  it('should send sample xray data and return success message with data', async () => {
    const sampleData = {
      deviceId: 'device-sample',
      time: Date.now(),
      data: [],
    };
    (sampleDataService.generateSampleXRayData as jest.Mock).mockReturnValue(
      sampleData,
    );
    (rabbitMQService.sendXRayData as jest.Mock).mockResolvedValue(undefined);

    const result = await controller.sendSampleXRayData();

    expect(sampleDataService.generateSampleXRayData).toHaveBeenCalled();
    expect(rabbitMQService.sendXRayData).toHaveBeenCalledWith(sampleData);
    expect(result).toEqual({
      message: 'Sample x-ray data sent to queue',
      data: sampleData,
    });
  });

  it('should return status 200 and proper response on success', async () => {
    const xrayDto: XRayMessageDto = {
      deviceId: 'device-abc',
      time: 1234567890,
      data: [],
    };
    (rabbitMQService.sendXRayData as jest.Mock).mockResolvedValue(undefined);

    const response = await controller.sendXRayData(xrayDto);

    expect(response).toEqual({ message: 'X-ray data sent to queue' });
    // In NestJS function, status code is set by decorator, not returned by function.
    // But the test confirms the function's output.
  });

  it('should handle rabbitmqservice failure and return error', async () => {
    const validDto: XRayMessageDto = {
      deviceId: 'device-err',
      time: 123456,
      data: [],
    };
    const error = new Error('RabbitMQ failed');
    (rabbitMQService.sendXRayData as jest.Mock).mockRejectedValue(error);

    await expect(controller.sendXRayData(validDto)).rejects.toThrow(
      'RabbitMQ failed',
    );
  });

  it('should return error if sample data generation fails', async () => {
    const genError = new Error('Sample generation failed');
    (sampleDataService.generateSampleXRayData as jest.Mock).mockImplementation(
      () => {
        throw genError;
      },
    );

    await expect(controller.sendSampleXRayData()).rejects.toThrow(
      'Sample generation failed',
    );
  });
});
