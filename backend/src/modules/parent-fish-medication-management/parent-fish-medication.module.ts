import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ParentFishMedicationService } from './parent-fish-medication.service';
import { ParentFishMedicationController } from './parent-fish-medication.controller';

@Module({
  controllers: [ParentFishMedicationController],
  providers: [ParentFishMedicationService, PrismaService],
})
export class ParentFishMedicationModule {}
