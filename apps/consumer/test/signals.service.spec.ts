import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { XRayDocument } from 'apps/consumer/src/signals/signals.schema';
import { XRayMessageDto } from '../src/dtos/xray-message.dto';
import { SignalsService } from '../src/signals/signals.service';

describe('SignalsService', () => {
  let service: SignalsService;
  let xrayModel: any;

  const mockXRayDocument: XRayDocument = {
    _id: '60c72b2f9b1e8b001c8e4d1a',
    deviceId: 'device-42',
    time: 1701234567,
    dataLength: 1,
    dataVolume: 60,
    data: [{ time: 1701234567, coordinatesAndSpeed: [1, 2, 3] }],
  } as any;

  const mockDto: XRayMessageDto = {
    deviceId: 'device-42',
    time: 1701234567,
    data: [{ time: 1701234567, coordinatesAndSpeed: [1, 2, 3] }],
  };

  beforeEach(async () => {
    const saveMock = jest.fn().mockResolvedValue(mockXRayDocument);
    const mockModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: saveMock,
    }));
    mockModel.find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockXRayDocument]),
    });
    mockModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockXRayDocument),
    });
    mockModel.findByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockXRayDocument),
    });
    mockModel.findByIdAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockXRayDocument),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalsService,
        {
          provide: getModelToken('XRay'),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<SignalsService>(SignalsService);
    xrayModel = module.get(getModelToken('XRay'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('shouldCreateXRayDataSuccessfully', async () => {
      const saveMock = jest.fn().mockResolvedValue(mockXRayDocument);
      xrayModel.mockImplementationOnce(() => ({
        ...mockXRayDocument,
        save: saveMock,
      }));

      const result = await service.create(mockDto);

      expect(xrayModel).toHaveBeenCalledWith({
        deviceId: mockDto.deviceId,
        time: mockDto.time,
        dataLength: mockDto.data.length,
        dataVolume: expect.any(Number),
        data: expect.any(Array),
      });
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockXRayDocument);
    });

    it('shouldThrowConflictExceptionOnDuplicateCreate', async () => {
      const saveMock = jest.fn().mockRejectedValue({ code: 11000 });
      xrayModel.mockImplementationOnce(() => ({
        ...mockXRayDocument,
        save: saveMock,
      }));

      await expect(service.create(mockDto)).rejects.toThrow(ConflictException);
      expect(saveMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('shouldRetrieveAndFilterXRayDataCorrectly', async () => {
      // No filter
      let result = await service.findAll();
      expect(xrayModel.find).toHaveBeenCalledWith({});
      expect(result).toEqual([mockXRayDocument]);

      // Filter deviceId
      result = await service.findAll('device-42');
      expect(xrayModel.find).toHaveBeenCalledWith({ deviceId: 'device-42' });

      // Filter time range
      result = await service.findAll('device-42', 1, 999);
      expect(xrayModel.find).toHaveBeenCalledWith({
        deviceId: 'device-42',
        time: { $gte: 1, $lte: 999 },
      });
    });
  });

  describe('findOne', () => {
    it('shouldThrowNotFoundExceptionForMissingXRayData', async () => {
      xrayModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('does-not-exist')).rejects.toThrow(
        NotFoundException,
      );
      expect(xrayModel.findById).toHaveBeenCalledWith('does-not-exist');
    });
  });

  describe('update', () => {
    it('shouldUpdateXRayDataSuccessfully', async () => {
      const result = await service.update('60c72b2f9b1e8b001c8e4d1a', mockDto);

      expect(xrayModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '60c72b2f9b1e8b001c8e4d1a',
        expect.objectContaining({
          deviceId: mockDto.deviceId,
          time: mockDto.time,
          dataLength: mockDto.data.length,
          dataVolume: expect.any(Number),
          data: expect.any(Array),
          updatedAt: expect.any(Date),
        }),
        { new: true },
      );
      expect(result).toEqual(mockXRayDocument);
    });

    it('shouldThrowNotFoundExceptionOnUpdateNonExistentXRayData', async () => {
      xrayModel.findByIdAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('no-id', mockDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('shouldThrowNotFoundExceptionOnDeleteNonExistentXRayData', async () => {
      xrayModel.findByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete('no-id')).rejects.toThrow(NotFoundException);
    });
  });
});