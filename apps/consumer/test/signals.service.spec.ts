// import { Test, TestingModule } from '@nestjs/testing';
// import { getModelToken } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { ConflictException, NotFoundException } from '@nestjs/common';
// import { SignalsService } from '../src/signals/signals.service';
// import { XRayDocument } from '../src/signals/signals.schema';
// import { XRayMessageDto } from '../src/dtos/xray-message.dto';

// describe('SignalsService', () => {
//   let service: SignalsService;
//   let model: Model<XRayDocument>;

//   const mockXRayDto: XRayMessageDto = {
//     deviceId: '66bb584d4ae73e488c30a072',
//     time: 1700000000,
//     data: [
//       {
//         time: 1700000000,
//         coordinatesAndSpeed: [1, 2, 3] as [number, number, number],
//       },
//     ],
//   };

//   const mockXRayDocument: XRayDocument = {
//     _id: '60c72b2f9b1e8b001c8e4d1a',
//     deviceId: mockXRayDto.deviceId,
//     time: mockXRayDto.time,
//     dataLength: mockXRayDto.data.length,
//     dataVolume: Buffer.byteLength(JSON.stringify(mockXRayDto.data)),
//     data: mockXRayDto.data.map((item) => ({
//       time: item.time,
//       coordinatesAndSpeed: item.coordinatesAndSpeed,
//     })),
//     save: jest.fn().mockResolvedValue(this),
//     updatedAt: new Date(),
//   } as any;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         SignalsService,
//         {
//           provide: getModelToken('XRay'),
//           useValue: {
//             create: jest.fn().mockImplementation((dto) => ({
//               ...dto,
//               _id: '60c72b2f9b1e8b001c8e4d1a',
//               save: jest.fn().mockResolvedValue({
//                 ...dto,
//                 _id: '60c72b2f9b1e8b001c8e4d1a',
//               }),
//             })),
//             find: jest.fn().mockReturnValue({
//               exec: jest.fn().mockResolvedValue([mockXRayDocument]),
//             }),
//             findById: jest.fn().mockReturnValue({
//               exec: jest.fn().mockResolvedValue(mockXRayDocument),
//             }),
//             findByIdAndUpdate: jest.fn().mockReturnValue({
//               exec: jest.fn().mockResolvedValue(mockXRayDocument),
//             }),
//             findByIdAndDelete: jest.fn().mockReturnValue({
//               exec: jest.fn().mockResolvedValue(mockXRayDocument),
//             }),
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<SignalsService>(SignalsService);
//     model = module.get<Model<XRayDocument>>(getModelToken('XRay'));
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('create', () => {
//     it('should create x-ray data with correct schema transformation', async () => {
//       const result = await service.create(mockXRayDto);

//       expect(model.create).toHaveBeenCalledWith({
//         deviceId: mockXRayDto.deviceId,
//         time: mockXRayDto.time,
//         dataLength: mockXRayDto.data.length,
//         dataVolume: Buffer.byteLength(JSON.stringify(mockXRayDto.data)),
//         data: mockXRayDto.data.map((item) => ({
//           time: item.time,
//           coordinatesAndSpeed: item.coordinatesAndSpeed,
//         })),
//       });

//       expect(result).toEqual(
//         expect.objectContaining({
//           deviceId: mockXRayDto.deviceId,
//           time: mockXRayDto.time,
//           dataLength: mockXRayDto.data.length,
//           data: expect.arrayContaining([
//             expect.objectContaining({
//               time: mockXRayDto.data[0].time,
//               coordinatesAndSpeed: mockXRayDto.data[0].coordinatesAndSpeed,
//             }),
//           ]),
//         }),
//       );
//     });

//     it('should throw ConflictException for duplicate data', async () => {
//       jest.spyOn(model, 'create').mockRejectedValueOnce({
//         code: 11000,
//         message: 'Duplicate key error',
//       });

//       await expect(service.create(mockXRayDto)).rejects.toThrow(
//         ConflictException,
//       );
//       expect(model.create).toHaveBeenCalled();
//     });

//     it('should correctly calculate data volume for multiple points', async () => {
//       const multiPointDto: XRayMessageDto = {
//         deviceId: 'device123',
//         time: 1700000000,
//         data: [
//           {
//             time: 1700000000,
//             coordinatesAndSpeed: [1, 2, 3] as [number, number, number],
//           },
//           {
//             time: 1700000001,
//             coordinatesAndSpeed: [4, 5, 6] as [number, number, number],
//           },
//         ],
//       };

//       await service.create(multiPointDto);

//       const expectedVolume = Buffer.byteLength(
//         JSON.stringify(multiPointDto.data),
//       );
//       expect(model.create).toHaveBeenCalledWith(
//         expect.objectContaining({
//           dataLength: 2,
//           dataVolume: expectedVolume,
//         }),
//       );
//     });
//   });

//   describe('findAll', () => {
//     it('should return empty array when no data found', async () => {
//       // Create a proper mock Query object
//       const mockQuery = {
//         exec: jest.fn().mockResolvedValueOnce([]),
//         // Add other required Query properties
//         where: jest.fn().mockReturnThis(),
//         equals: jest.fn().mockReturnThis(),
//         sort: jest.fn().mockReturnThis(),
//         // Add any other Query methods your service might use
//       } as unknown as ReturnType<Model<XRayDocument>['find']>;

//       jest.spyOn(model, 'find').mockReturnValueOnce(mockQuery);

//       const result = await service.findAll();
//       expect(result).toEqual([]);
//       expect(model.find).toHaveBeenCalledWith({});
//     });
//   });

//   describe('findOne', () => {
//     it('should return document when found', async () => {
//       // Create a proper mock Query object for findById
//       const mockQuery = {
//         exec: jest.fn().mockResolvedValue(mockXRayDocument),
//         where: jest.fn().mockReturnThis(),
//         equals: jest.fn().mockReturnThis(),
//         select: jest.fn().mockReturnThis(),
//         lean: jest.fn().mockReturnThis(),
//         // Add other Query methods as needed
//       } as unknown as ReturnType<Model<XRayDocument>['findById']>;

//       jest.spyOn(model, 'findById').mockReturnValueOnce(mockQuery);

//       const result = await service.findOne('valid-id');
//       expect(result).toEqual(mockXRayDocument);
//       expect(model.findById).toHaveBeenCalledWith('valid-id');
//     });

//     it('should throw NotFoundException for invalid id', async () => {
//       // Create a proper mock Query object that returns null
//       const mockQuery = {
//         exec: jest.fn().mockResolvedValue(null),
//         where: jest.fn().mockReturnThis(),
//         equals: jest.fn().mockReturnThis(),
//         // Add other Query methods as needed
//       } as unknown as ReturnType<Model<XRayDocument>['findById']>;

//       jest.spyOn(model, 'findById').mockReturnValueOnce(mockQuery);

//       await expect(service.findOne('invalid-id')).rejects.toThrow(
//         NotFoundException,
//       );
//     });
//   });

//   describe('update', () => {
//     it('should update document with correct data transformation', async () => {
//       // Create proper mock Query object for findByIdAndUpdate
//       const mockQuery = {
//         exec: jest.fn().mockResolvedValue(mockXRayDocument),
//         where: jest.fn().mockReturnThis(),
//         set: jest.fn().mockReturnThis(),
//         lean: jest.fn().mockReturnThis(),
//         // Add other Query methods as needed
//       } as unknown as ReturnType<Model<XRayDocument>['findByIdAndUpdate']>;

//       jest.spyOn(model, 'findByIdAndUpdate').mockReturnValueOnce(mockQuery);

//       const result = await service.update('valid-id', mockXRayDto);

//       expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
//         'valid-id',
//         {
//           deviceId: mockXRayDto.deviceId,
//           time: mockXRayDto.time,
//           dataLength: mockXRayDto.data.length,
//           dataVolume: Buffer.byteLength(JSON.stringify(mockXRayDto.data)),
//           data: mockXRayDto.data.map((item) => ({
//             time: item.time,
//             coordinatesAndSpeed: item.coordinatesAndSpeed,
//           })),
//           updatedAt: expect.any(Date),
//         },
//         { new: true },
//       );
//       expect(result).toEqual(mockXRayDocument);
//     });

//     it('should throw NotFoundException when document doesnt exist', async () => {
//       // Create proper mock Query object that returns null
//       const mockQuery = {
//         exec: jest.fn().mockResolvedValue(null),
//         where: jest.fn().mockReturnThis(),
//         set: jest.fn().mockReturnThis(),
//         // Add other Query methods as needed
//       } as unknown as ReturnType<Model<XRayDocument>['findByIdAndUpdate']>;

//       jest.spyOn(model, 'findByIdAndUpdate').mockReturnValueOnce(mockQuery);

//       await expect(service.update('invalid-id', mockXRayDto)).rejects.toThrow(
//         NotFoundException,
//       );
//     });
//   });

//   describe('delete', () => {
//     it('should delete document successfully', async () => {
//       // Create proper mock Query object for successful deletion
//       const mockQuery = {
//         exec: jest.fn().mockResolvedValue(mockXRayDocument),
//         where: jest.fn().mockReturnThis(),
//         lean: jest.fn().mockReturnThis(),
//         // Add other Query methods as needed
//       } as unknown as ReturnType<Model<XRayDocument>['findByIdAndDelete']>;

//       jest.spyOn(model, 'findByIdAndDelete').mockReturnValueOnce(mockQuery);

//       await service.delete('valid-id');
//       expect(model.findByIdAndDelete).toHaveBeenCalledWith('valid-id');
//     });

//     it('should throw NotFoundException when document doesnt exist', async () => {
//       // Create proper mock Query object that returns null
//       const mockQuery = {
//         exec: jest.fn().mockResolvedValue(null),
//         where: jest.fn().mockReturnThis(),
//         // Add other Query methods as needed
//       } as unknown as ReturnType<Model<XRayDocument>['findByIdAndDelete']>;

//       jest.spyOn(model, 'findByIdAndDelete').mockReturnValueOnce(mockQuery);

//       await expect(service.delete('invalid-id')).rejects.toThrow(
//         NotFoundException,
//       );
//     });
//   });
// });

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SignalsService } from '../src/signals/signals.service';
import { XRayDocument } from '../src/signals/signals.schema';
import { XRayMessageDto } from '../src/dtos/xray-message.dto';

// Test Data Setup
const mockXRayDto: XRayMessageDto = {
  deviceId: '66bb584d4ae73e488c30a072',
  time: 1700000000,
  data: [
    {
      time: 1700000000,
      coordinatesAndSpeed: [1, 2, 3] as [number, number, number],
    },
  ],
};

const mockXRayDocument: XRayDocument = {
  _id: '60c72b2f9b1e8b001c8e4d1a',
  deviceId: mockXRayDto.deviceId,
  time: mockXRayDto.time,
  dataLength: mockXRayDto.data.length,
  dataVolume: Buffer.byteLength(JSON.stringify(mockXRayDto.data)),
  data: mockXRayDto.data.map((item) => ({
    time: item.time,
    coordinatesAndSpeed: item.coordinatesAndSpeed,
  })),
  save: jest.fn().mockResolvedValue(this),
  updatedAt: new Date(),
} as any;

type QueryMethod =
  | 'find'
  | 'findById'
  | 'findByIdAndUpdate'
  | 'findByIdAndDelete';

function createMockQuery<T>(
  execResult: T,
  method: QueryMethod,
): ReturnType<Model<XRayDocument>[QueryMethod]> {
  const baseMock = {
    exec: jest.fn().mockResolvedValue(execResult),
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
  };

  // Method-specific additions
  if (method === 'findByIdAndUpdate') {
    return {
      ...baseMock,
      new: jest.fn().mockReturnThis(),
    } as unknown as ReturnType<Model<XRayDocument>[QueryMethod]>;
  }

  return baseMock as unknown as ReturnType<Model<XRayDocument>[QueryMethod]>;
}

describe('SignalsService', () => {
  let service: SignalsService;
  let model: Model<XRayDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalsService,
        {
          provide: getModelToken('XRay'),
          useValue: {
            create: jest.fn().mockImplementation((dto) => ({
              ...dto,
              _id: '60c72b2f9b1e8b001c8e4d1a',
              save: jest.fn().mockResolvedValue({
                ...dto,
                _id: '60c72b2f9b1e8b001c8e4d1a',
              }),
            })),
            find: jest
              .fn()
              .mockImplementation(() =>
                createMockQuery([mockXRayDocument], 'find'),
              ),
            findById: jest
              .fn()
              .mockImplementation(() =>
                createMockQuery(mockXRayDocument, 'findById'),
              ),
            findByIdAndUpdate: jest
              .fn()
              .mockImplementation(() =>
                createMockQuery(mockXRayDocument, 'findByIdAndUpdate'),
              ),
            findByIdAndDelete: jest
              .fn()
              .mockImplementation(() =>
                createMockQuery(mockXRayDocument, 'findByIdAndDelete'),
              ),
          },
        },
      ],
    }).compile();

    service = module.get<SignalsService>(SignalsService);
    model = module.get<Model<XRayDocument>>(getModelToken('XRay'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create x-ray data with correct schema transformation', async () => {
      const result = await service.create(mockXRayDto);

      expect(model.create).toHaveBeenCalledWith({
        deviceId: mockXRayDto.deviceId,
        time: mockXRayDto.time,
        dataLength: mockXRayDto.data.length,
        dataVolume: Buffer.byteLength(JSON.stringify(mockXRayDto.data)),
        data: mockXRayDto.data.map((item) => ({
          time: item.time,
          coordinatesAndSpeed: item.coordinatesAndSpeed,
        })),
      });

      expect(result).toEqual(
        expect.objectContaining({
          deviceId: mockXRayDto.deviceId,
          time: mockXRayDto.time,
          dataLength: mockXRayDto.data.length,
          data: expect.arrayContaining([
            expect.objectContaining({
              time: mockXRayDto.data[0].time,
              coordinatesAndSpeed: mockXRayDto.data[0].coordinatesAndSpeed,
            }),
          ]),
        }),
      );
    });

    it('should throw ConflictException for duplicate data', async () => {
      jest.spyOn(model, 'create').mockRejectedValueOnce({
        code: 11000,
        message: 'Duplicate key error',
      });

      await expect(service.create(mockXRayDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should correctly calculate data volume for multiple points', async () => {
      const multiPointDto: XRayMessageDto = {
        deviceId: 'device123',
        time: 1700000000,
        data: [
          {
            time: 1700000000,
            coordinatesAndSpeed: [1, 2, 3] as [number, number, number],
          },
          {
            time: 1700000001,
            coordinatesAndSpeed: [4, 5, 6] as [number, number, number],
          },
        ],
      };

      await service.create(multiPointDto);

      const expectedVolume = Buffer.byteLength(
        JSON.stringify(multiPointDto.data),
      );
      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dataLength: 2,
          dataVolume: expectedVolume,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all data with no filters', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockXRayDocument]);
      expect(model.find).toHaveBeenCalledWith({});
    });

    it('should return empty array when no data found', async () => {
      jest
        .spyOn(model, 'find')
        .mockImplementationOnce(() => createMockQuery([], 'find'));

      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('should apply deviceId filter', async () => {
      const deviceId = 'test-device';
      await service.findAll(deviceId);
      expect(model.find).toHaveBeenCalledWith({ deviceId });
    });

    it('should apply time range filter', async () => {
      const startTime = 1700000000;
      const endTime = 1700001000;
      await service.findAll(undefined, startTime, endTime);
      expect(model.find).toHaveBeenCalledWith({
        time: { $gte: startTime, $lte: endTime },
      });
    });
  });

  describe('findOne', () => {
    it('should return document when found', async () => {
      const result = await service.findOne('valid-id');
      expect(result).toEqual(mockXRayDocument);
      expect(model.findById).toHaveBeenCalledWith('valid-id');
    });

    it('should throw NotFoundException for invalid id', async () => {
      jest
        .spyOn(model, 'findById')
        .mockImplementationOnce(() => createMockQuery(null, 'findById'));

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update document with correct data transformation', async () => {
      const result = await service.update('valid-id', mockXRayDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'valid-id',
        expect.objectContaining({
          deviceId: mockXRayDto.deviceId,
          time: mockXRayDto.time,
          data: expect.arrayContaining([
            expect.objectContaining({
              coordinatesAndSpeed: mockXRayDto.data[0].coordinatesAndSpeed,
            }),
          ]),
        }),
        { new: true },
      );
      expect(result).toEqual(mockXRayDocument);
    });

    it('should throw NotFoundException when document doesnt exist', async () => {
      jest
        .spyOn(model, 'findByIdAndUpdate')
        .mockImplementationOnce(() =>
          createMockQuery(null, 'findByIdAndUpdate'),
        );

      await expect(service.update('invalid-id', mockXRayDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete document successfully', async () => {
      await service.delete('valid-id');
      expect(model.findByIdAndDelete).toHaveBeenCalledWith('valid-id');
    });

    it('should throw NotFoundException when document doesnt exist', async () => {
      jest
        .spyOn(model, 'findByIdAndDelete')
        .mockImplementationOnce(() =>
          createMockQuery(null, 'findByIdAndDelete'),
        );

      await expect(service.delete('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});