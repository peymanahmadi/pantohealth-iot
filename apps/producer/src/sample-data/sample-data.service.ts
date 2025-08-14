import { Injectable } from '@nestjs/common';
import { XRayMessageDto } from '@pantohealth/dtos';

@Injectable()
export class SampleDataService {
  generateSampleXRayData(): XRayMessageDto {
    return {
      deviceId: `device-${Math.random().toString(36).substring(2, 15)}`,
      time: Date.now(),
      data: [
        {
          time: Date.now(),
          coordinatesAndSpeed: [
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 50,
          ],
        },
        {
          time: Date.now() + 1000,
          coordinatesAndSpeed: [
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 50,
          ],
        },
      ],
    };
  }
}
