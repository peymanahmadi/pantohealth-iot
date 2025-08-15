import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignalsService } from './signals.service';
import { XRayDocument } from './signals.schema';
import { XRayMessageDto } from '../dtos/xray-message.dto';

@Controller('signals')
@ApiTags('Signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: XRayMessageDto })
  @ApiResponse({
    status: 201,
    description: 'X-ray data created successfully',
    type: XRayMessageDto,
  })
  @ApiResponse({ status: 409, description: 'X-ray data already exists' })
  async createSignal(
    @Body() createSignalDto: XRayMessageDto,
  ): Promise<XRayDocument> {
    return this.signalsService.create(createSignalDto);
  }

  @Get()
  @ApiQuery({
    name: 'deviceId',
    required: false,
    description: 'Filter by device ID',
  })
  @ApiQuery({
    name: 'startTime',
    required: false,
    type: Number,
    description: 'Filter by start time (Unix timestamp)',
  })
  @ApiQuery({
    name: 'endTime',
    required: false,
    type: Number,
    description: 'Filter by end time (Unix timestamp)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of x-ray data',
    type: [XRayMessageDto],
  })
  async findAll(
    @Query('deviceId') deviceId?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ): Promise<XRayDocument[]> {
    return this.signalsService.findAll(
      deviceId,
      startTime ? Number(startTime) : undefined,
      endTime ? Number(endTime) : undefined,
    );
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'X-ray data ID' })
  @ApiBody({ type: XRayMessageDto })
  @ApiResponse({
    status: 200,
    description: 'X-ray data updated successfully',
    type: XRayMessageDto,
  })
  @ApiResponse({ status: 404, description: 'X-ray data not found' })
  async update(
    @Param('id') id: string,
    @Body() updateSignalDto: XRayMessageDto,
  ): Promise<XRayDocument> {
    return this.signalsService.update(id, updateSignalDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'X-ray data ID' })
  @ApiResponse({ status: 204, description: 'X-ray data deleted successfully' })
  @ApiResponse({ status: 404, description: 'X-ray data not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.signalsService.delete(id);
  }
}
