import { Module } from '@nestjs/common';
import { LaboratoryBoxService } from './laboratory-box.service';
import { LaboratoryBoxController } from './laboratory-box.controller';
import { LaboratoryBoxGateway } from './laboratory-box.gateway';

@Module({
  controllers: [LaboratoryBoxController],
  providers: [LaboratoryBoxService, LaboratoryBoxGateway],
})
export class LaboratoryBoxModule {}
