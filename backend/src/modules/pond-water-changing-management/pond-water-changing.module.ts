import { Module } from '@nestjs/common';
import { PondWaterChangingService } from './pond-water-changing.service';
import { PondWaterChangingController } from './pond-water-changing.controller';
import { PondWaterChangingGateway } from './pond-water-changing.gateway';

@Module({
  controllers: [PondWaterChangingController],
  providers: [PondWaterChangingService, PondWaterChangingGateway],
})
export class PondWaterChangingModule {}
