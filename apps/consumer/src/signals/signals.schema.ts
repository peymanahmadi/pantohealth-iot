import { Schema } from 'mongoose';

export interface XRayDataPoint {
  time: number;
  coordinatesAndSpeed: [number, number, number]; // [x, y, speed]
}

export interface XRayDocument extends Document {
  deviceId: string;
  time: number;
  dataLength: number;
  dataVolume: number;
  data: XRayDataPoint[];
}

export const XRaySchema = new Schema(
  {
    deviceId: { type: String, required: true },
    time: { type: Number, required: true },
    dataLength: { type: Number, required: true },
    dataVolume: { type: Number, required: true },
    data: [
      {
        time: { type: Number, required: true },
        coordinatesAndSpeed: {
          type: [Number],
          required: true,
          validate: {
            validator: (arr: number[]) => arr.length === 3,
            message:
              'coordinatesAndSpeed must contain exactly 3 numbers [x, y, speed]',
          },
        },
      },
    ],
  },
  { timestamps: true, collection: 'xray-signals' },
);

XRaySchema.index({ deviceId: 1, time: 1 }, { unique: true });
