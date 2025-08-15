import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { RabbitMQController } from '../src/rabbitmq/rabbitmq.controller';
import { SignalsService } from '../src/signals/signals.service';
import { XRayMessageDto } from '../src/dtos/xray-message.dto';

describe('RabbitMQController', () => {
  let controller: RabbitMQController;
  let signalsService: SignalsService;
  let logger: Logger;

  const mockValidMessage = {
    deviceId: '66bb584d4ae73e488c30a072',
    time: 1700000000,
    data: [{ time: 1700000000, coordinatesAndSpeed: [1, 2, 3] }],
  };

  const mockInvalidMessage = {
    deviceId: 'invalid-id', // invalid format
    time: 'not-a-number', // invalid type
    data: 'not-an-array', // invalid type
  };

  const mockRmqContext = {
    getChannelRef: jest.fn().mockReturnValue({
      ack: jest.fn(),
    }),
    getMessage: jest.fn().mockReturnValue({}),
  } as unknown as RmqContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RabbitMQController],
      providers: [
        {
          provide: SignalsService,
          useValue: {
            create: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<RabbitMQController>(RabbitMQController);
    signalsService = module.get<SignalsService>(SignalsService);
    logger = controller['logger']; // Access the private logger
    jest.spyOn(logger, 'log');
    jest.spyOn(logger, 'error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleXRayMessage', () => {
    it('should process valid message successfully', async () => {
      await controller.handleXRayMessage(mockValidMessage, mockRmqContext);

      // Verify validation and transformation
      const dto = plainToClass(XRayMessageDto, mockValidMessage);
      expect(await validate(dto)).toHaveLength(0);

      // Verify service call
      expect(signalsService.create).toHaveBeenCalledWith(dto);

      // Verify logging
      expect(logger.log).toHaveBeenCalledWith(
        `Processed message for deviceId: ${mockValidMessage.deviceId}`,
      );

      // Verify message acknowledgment
      expect(mockRmqContext.getChannelRef().ack).toHaveBeenCalled();
    });

    it('should reject invalid message and log error', async () => {
      await controller.handleXRayMessage(mockInvalidMessage, mockRmqContext);

      // Verify validation fails
      const dto = plainToClass(XRayMessageDto, mockInvalidMessage);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      // Verify error logging
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid message:'),
      );

      // Verify no service call
      expect(signalsService.create).not.toHaveBeenCalled();

      // Verify no acknowledgment
      expect(mockRmqContext.getChannelRef().ack).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      const errorMessage = 'Database error';
      signalsService.create = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      await controller.handleXRayMessage(mockValidMessage, mockRmqContext);

      // Verify error logging
      expect(logger.error).toHaveBeenCalledWith(
        `Error processing message: ${errorMessage}`,
      );

      // Verify no acknowledgment on error
      expect(mockRmqContext.getChannelRef().ack).not.toHaveBeenCalled();
    });

    it('should acknowledge message after successful processing', async () => {
      await controller.handleXRayMessage(mockValidMessage, mockRmqContext);

      // Verify channel.ack was called with the correct message
      expect(mockRmqContext.getChannelRef().ack).toHaveBeenCalledWith(
        mockRmqContext.getMessage(),
      );
    });
  });

  // Test the plainToClass and validate functions independently
  describe('Message Validation', () => {
    it('should transform and validate correct DTO', async () => {
      const dto = plainToClass(XRayMessageDto, mockValidMessage);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for incorrect DTO', async () => {
      const dto = plainToClass(XRayMessageDto, mockInvalidMessage);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});