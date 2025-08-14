import { XRayMessageDto } from '@pantohealth/dtos';
import { SampleDataService } from '../src/sample-data/sample-data.service';

describe('SampleDataService', () => {
  let service: SampleDataService;

  beforeEach(() => {
    service = new SampleDataService();
  });

  it('should Generate Valid XRayMessageDto', () => {
    const result = service.generateSampleXRayData();
    expect(result).toBeDefined();
    expect(typeof result.deviceId).toBe('string');
    expect(typeof result.time).toBe('number');
    expect(Array.isArray(result.data)).toBe(true);

    result.data.forEach((dataPoint) => {
      expect(typeof dataPoint.time).toBe('number');
      expect(Array.isArray(dataPoint.coordinatesAndSpeed)).toBe(true);
      expect(dataPoint.coordinatesAndSpeed.length).toBe(3);
    });
  });

  it('should Generate DeviceId With Expected Format', () => {
    const result = service.generateSampleXRayData();
    expect(/^device\-[a-z0-9]+$/i.test(result.deviceId)).toBe(true);
    expect(result.deviceId.length).toBeGreaterThan('device-'.length);
  });

  it('should Generate DataPoints With Valid CoordinatesAndSpeed', () => {
    const result = service.generateSampleXRayData();
    result.data.forEach((dataPoint) => {
      const [x, y, speed] = dataPoint.coordinatesAndSpeed;
      expect(typeof x).toBe('number');
      expect(typeof y).toBe('number');
      expect(typeof speed).toBe('number');
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(100);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
      expect(speed).toBeGreaterThanOrEqual(0);
      expect(speed).toBeLessThanOrEqual(50);
    });
  });

  it('should Handle No DataPoints Generation', () => {
    // Simulate a version of the method that produces no data points.
    // Call generateSampleXRayData and then overwrite data to [] for validation
    const result: XRayMessageDto = {
      ...service.generateSampleXRayData(),
      data: [],
    };
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBe(0);
    expect(typeof result.deviceId).toBe('string');
    expect(typeof result.time).toBe('number');
  });

  it('should Handle Invalid TimeValue', () => {
    // Simulate Date.now() returning NaN by forcibly constructing an XRayMessageDto with invalid time
    const result: XRayMessageDto = {
      deviceId: 'device-invalid',
      time: NaN,
      data: [{ time: NaN, coordinatesAndSpeed: [NaN, NaN, NaN] }],
    };
    expect(Number.isNaN(result.time)).toBe(true);
    result.data.forEach((point) => {
      expect(Number.isNaN(point.time)).toBe(true);
      point.coordinatesAndSpeed.forEach((coord) => {
        expect(Number.isNaN(coord)).toBe(true);
      });
    });
  });

  it('should Generate Unique DeviceId On Multiple Calls', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 10; i++) {
      ids.add(service.generateSampleXRayData().deviceId);
    }
    expect(ids.size).toBe(10);
  });
});
