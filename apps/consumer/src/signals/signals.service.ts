import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { XRayDataPoint, XRayDocument } from './signals.schema';
import { XRayMessageDto } from '@pantohealth/dtos';

@Injectable()
export class SignalsService {
  constructor(@InjectModel('XRay') private xrayModel: Model<XRayDocument>) {}

  async create(dto: XRayMessageDto): Promise<XRayDocument> {
    const { deviceId, time, data } = dto;

    // Calculate dataLength and dataVolume
    const dataLength = data.length;
    const dataVolume = Buffer.byteLength(JSON.stringify(data));

    // Map DTO data to schema format
    const xrayData: XRayDataPoint[] = data.map((item) => ({
      time: item.time,
      coordinatesAndSpeed: item.coordinatesAndSpeed,
    }));

    try {
      const xray = new this.xrayModel({
        deviceId,
        time,
        dataLength,
        dataVolume,
        data: xrayData,
      });
      return await xray.save();
    } catch (error) {
      if (error.code === 11000) {
        // MongoDB duplicate key error
        throw new ConflictException(
          `X-ray data for deviceId ${deviceId} and time ${time} already exists`,
        );
      }
      throw error;
    }
  }

  async findAll(
    deviceId?: string,
    startTime?: number,
    endTime?: number,
  ): Promise<XRayDocument[]> {
    const query: any = {};
    if (deviceId) query.deviceId = deviceId;
    if (startTime || endTime) {
      query.time = {};
      if (startTime) query.time.$gte = startTime;
      if (endTime) query.time.$lte = endTime;
    }
    return this.xrayModel.find(query).exec();
  }

  async findOne(id: string): Promise<XRayDocument> {
    const xray = await this.xrayModel.findById(id).exec();
    if (!xray) {
      throw new NotFoundException(`X-ray data with ID ${id} not found`);
    }
    return xray;
  }

  async update(id: string, dto: XRayMessageDto): Promise<XRayDocument> {
    const { deviceId, time, data } = dto;

    // Calculate dataLength and dataVolume
    const dataLength = data.length;
    const dataVolume = Buffer.byteLength(JSON.stringify(data));

    // Map DTO data to schema format
    const xrayData: XRayDataPoint[] = data.map((item) => ({
      time: item.time,
      coordinatesAndSpeed: item.coordinatesAndSpeed,
    }));

    const xray = await this.xrayModel
      .findByIdAndUpdate(
        id,
        {
          deviceId,
          time,
          dataLength,
          dataVolume,
          data: xrayData,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!xray) {
      throw new NotFoundException(`X-ray data with ID ${id} not found`);
    }

    return xray;
  }

  async delete(id: string): Promise<void> {
    const result = await this.xrayModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`X-ray data with ID ${id} not found`);
    }
  }
}
