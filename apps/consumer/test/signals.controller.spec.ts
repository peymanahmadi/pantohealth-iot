import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SignalsController } from '../src/signals/signals.controller';
import { SignalsService } from '../src/signals/signals.service';
import { XRayDocument } from '../src/signals/signals.schema';
import { XRayMessageDto } from '../src/dtos/xray-message.dto';

describe('SignalsController', () => {
  let controller: SignalsController;
  let signalsService: SignalsService;

  const mockXRayDocument: XRayDocument = {
    _id: '60c72b2f9b1e8b001c8e4d1a',
    deviceId: '66bb584d4ae73e488c30a072',
    time: 1700000000,
    dataLength: 1,
    dataVolume: 100,
    data: [{ time: 1700000000, coordinatesAndSpeed: [1, 2, 3] }],
  } as any;

  const mockXRayDto: XRayMessageDto = {
    deviceId: '66bb584d4ae73e488c30a072',
    time: 1700000000,
    data: [{ time: 1700000000, coordinatesAndSpeed: [1, 2, 3] }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignalsController],
      providers: [
        {
          provide: SignalsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockXRayDocument),
            findAll: jest.fn().mockResolvedValue([mockXRayDocument]),
            update: jest.fn().mockResolvedValue(mockXRayDocument),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<SignalsController>(SignalsController);
    signalsService = module.get<SignalsService>(SignalsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSignal', () => {
    it('should create new x-ray data', async () => {
      const result = await controller.createSignal(mockXRayDto);

      expect(signalsService.create).toHaveBeenCalledWith(mockXRayDto);
      expect(result).toEqual(mockXRayDocument);
    });

    it('should throw ConflictException for duplicate data', async () => {
      jest
        .spyOn(signalsService, 'create')
        .mockRejectedValueOnce(
          new ConflictException('X-ray data already exists'),
        );

      await expect(controller.createSignal(mockXRayDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all x-ray data without filters', async () => {
      const result = await controller.findAll();

      expect(signalsService.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual([mockXRayDocument]);
    });

    it('should return filtered data with deviceId', async () => {
      const deviceId = '66bb584d4ae73e488c30a072';
      const result = await controller.findAll(deviceId);

      expect(signalsService.findAll).toHaveBeenCalledWith(
        deviceId,
        undefined,
        undefined,
      );
      expect(result).toEqual([mockXRayDocument]);
    });

    it('should return filtered data with time range', async () => {
      const startTime = '1700000000';
      const endTime = '1700001000';
      const result = await controller.findAll(undefined, startTime, endTime);

      expect(signalsService.findAll).toHaveBeenCalledWith(
        undefined,
        1700000000,
        1700001000,
      );
      expect(result).toEqual([mockXRayDocument]);
    });
  });

  describe('update', () => {
    it('should update x-ray data', async () => {
      const id = '60c72b2f9b1e8b001c8e4d1a';
      const result = await controller.update(id, mockXRayDto);

      expect(signalsService.update).toHaveBeenCalledWith(id, mockXRayDto);
      expect(result).toEqual(mockXRayDocument);
    });

    it('should throw NotFoundException for non-existent id', async () => {
      const id = 'non-existent-id';
      jest
        .spyOn(signalsService, 'update')
        .mockRejectedValueOnce(new NotFoundException('X-ray data not found'));

      await expect(controller.update(id, mockXRayDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete x-ray data', async () => {
      const id = '60c72b2f9b1e8b001c8e4d1a';
      await controller.delete(id);

      expect(signalsService.delete).toHaveBeenCalledWith(id);
      // Verify NO_CONTENT (204) is returned by checking no return value
    });

    it('should throw NotFoundException for non-existent id', async () => {
      const id = 'non-existent-id';
      jest
        .spyOn(signalsService, 'delete')
        .mockRejectedValueOnce(new NotFoundException('X-ray data not found'));

      await expect(controller.delete(id)).rejects.toThrow(NotFoundException);
    });

    it('should return 204 status code on success', async () => {
      const id = '60c72b2f9b1e8b001c8e4d1a';
      const response = await controller.delete(id);

      expect(response).toBeUndefined(); // NO_CONTENT has no body
      // The @HttpCode(HttpStatus.NO_CONTENT) decorator ensures 204 status
    });
  });

  // Test query parameter transformations
  describe('Query Parameter Handling', () => {
    it('should convert string timestamps to numbers', async () => {
      const startTime = '1700000000';
      const endTime = '1700001000';

      await controller.findAll(undefined, startTime, endTime);

      expect(signalsService.findAll).toHaveBeenCalledWith(
        undefined,
        1700000000,
        1700001000,
      );
    });

    it('should handle undefined timestamps', async () => {
      await controller.findAll(undefined, undefined, undefined);

      expect(signalsService.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
      );
    });
  });
});