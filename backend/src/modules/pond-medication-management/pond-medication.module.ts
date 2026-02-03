import { Module } from '@nestjs/common';
import { PondMedicationService } from './pond-medication.service';
import { PondMedicationController } from './pond-medication.controller';
import { PondMedicationGateway } from './pond-medication.gateway';

@Module({
  controllers: [PondMedicationController],
  providers: [PondMedicationService, PondMedicationGateway],
})
export class PondMedicationModule {}
