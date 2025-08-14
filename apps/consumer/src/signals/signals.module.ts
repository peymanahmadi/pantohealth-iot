import { Module } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { SignalsController } from './signals.controller';
import { XRaySchema } from './signals.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'XRay', schema: XRaySchema }])],
  providers: [SignalsService],
  controllers: [SignalsController],
  exports: [SignalsService],
})
export class SignalsModule {}
