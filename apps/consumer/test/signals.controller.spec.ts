// import { Test, TestingModule } from '@nestjs/testing';
// import { ConflictException, NotFoundException } from '@nestjs/common';
// import { SignalsController } from '../src/signals/signals.controller';
// import { SignalsService } from '../src/signals/signals.service';
// import { XRayMessageDto } from '../src/dtos/xray-message.dto';
// import { XRayDocument } from '../src/signals/signals.schema';

// describe('SignalsController', () => {
//   let controller: SignalsController;
//   let service: jest.Mocked<SignalsService>;

//   const mockXRayDto: XRayMessageDto = {
//     deviceId: '66bb584d4ae73e488c30a072',
//     time: 1735683480000,
//     data: [{ time: 1735683480000, coordinatesAndSpeed: [10, 20, 30] }],
//   };

//   const mockXRayDocument: XRayDocument = {
//     _id: 'mockId',
//     deviceId: mockXRayDto.deviceId,
//     time: mockXRayDto.time,
//     dataLength: mockXRayDto.data.length,
//     dataVolume: Buffer.byteLength(JSON.stringify(mockXRayDto.data)),
//     data: mockXRayDto.data,
//   } as any;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [SignalsController],
//       providers: [
//         {
//           provide: SignalsService,
//           useValue: {
//             create: jest.fn().mockResolvedValue(mockXRayDocument),
//             findAll: jest.fn().mockResolvedValue([mockXRayDocument]),
//             findOne: jest.fn().mockResolvedValue(mockXRayDocument),
//             update: jest.fn().mockResolvedValue(mockXRayDocument),
//             delete: jest.fn().mockResolvedValue(undefined),
//           },
//         },
//       ],
//     }).compile();

//     controller = module.get<SignalsController>(SignalsController);
//     service = module.get(SignalsService) as jest.Mocked<SignalsService>;
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('create', () => {
//     it('should create x-ray data', async () => {
//       const result = await controller.createSignal(mockXRayDto);
//       expect(service.create).toHaveBeenCalledWith(mockXRayDto);
//       expect(result).toEqual(mockXRayDocument);
//     });

//     it('should throw ConflictException for duplicate data', async () => {
//       service.create.mockRejectedValueOnce(new ConflictException());
//       await expect(controller.createSignal(mockXRayDto)).rejects.toThrow(
//         ConflictException,
//       );
//     });
//   });

//   describe('findAll', () => {
//     it('should return all x-ray data without filters', async () => {
//       const result = await controller.findAll();
//       expect(service.findAll).toHaveBeenCalledWith(
//         undefined,
//         undefined,
//         undefined,
//       );
//       expect(result).toEqual([mockXRayDocument]);
//     });

//     it('should return filtered x-ray data', async () => {
//       const result = await controller.findAll(
//         '66bb584d4ae73e488c30a072',
//         '1735683480000',
//         '1735683481000',
//       );
//       expect(service.findAll).toHaveBeenCalledWith(
//         '66bb584d4ae73e488c30a072',
//         1735683480000,
//         1735683481000,
//       );
//       expect(result).toEqual([mockXRayDocument]);
//     });
//   });

//   // describe('findOne', () => {
//   //   it('should return x-ray data by ID', async () => {
//   //     const result = await controller.findOne('mockId');
//   //     expect(service.findOne).toHaveBeenCalledWith('mockId');
//   //     expect(result).toEqual(mockXRayDocument);
//   //   });

//   //   it('should throw NotFoundException if not found', async () => {
//   //     service.findOne.mockRejectedValueOnce(new NotFoundException());
//   //     await expect(controller.findOne('mockId')).rejects.toThrow(
//   //       NotFoundException,
//   //     );
//   //   });
//   // });

//   describe('update', () => {
//     it('should update x-ray data by ID', async () => {
//       const result = await controller.update('mockId', mockXRayDto);
//       expect(service.update).toHaveBeenCalledWith('mockId', mockXRayDto);
//       expect(result).toEqual(mockXRayDocument);
//     });

//     it('should throw NotFoundException if not found', async () => {
//       service.update.mockRejectedValueOnce(new NotFoundException());
//       await expect(controller.update('mockId', mockXRayDto)).rejects.toThrow(
//         NotFoundException,
//       );
//     });
//   });

//   describe('delete', () => {
//     it('should delete x-ray data by ID', async () => {
//       await controller.delete('mockId');
//       expect(service.delete).toHaveBeenCalledWith('mockId');
//     });

//     it('should throw NotFoundException if not found', async () => {
//       service.delete.mockRejectedValueOnce(new NotFoundException());
//       await expect(controller.delete('mockId')).rejects.toThrow(
//         NotFoundException,
//       );
//     });
//   });
// });

import { Test, TestingModule } from '@nestjs/testing';
// import { SignalsController } from './signals.controller';
// import { SignalsService } from './signals.service';
// import { XRayMessageDto } from '../dtos/xray-message.dto';
import {
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SignalsController } from '../src/signals/signals.controller';
import { SignalsService } from '../src/signals/signals.service';
import { XRayDocument } from '../src/signals/signals.schema';
import { XRayMessageDto } from '../src/dtos/xray-message.dto';
// import { XRayDocument } from './signals.schema';

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