import { Module } from '@nestjs/common';
import { LaboratoryBoxWaterChangingService } from './box-water-changing.service';
import { LaboratoryBoxWaterChangingController } from './box-water-changing.controller';
import { LaboratoryBoxWaterChangingGateway } from './box-water-changing.gateway';

@Module({
  controllers: [LaboratoryBoxWaterChangingController],
  providers: [
    LaboratoryBoxWaterChangingService,
    LaboratoryBoxWaterChangingGateway,
  ],
})
export class LaboratoryBoxWaterChangingModule {}
