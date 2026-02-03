import { Module } from '@nestjs/common';
import { EggFishMedicationService } from './egg-fish-medication.service';
import { EggFishMedicationController } from './egg-fish-medication.controller';
import { EggFishMedicationGateway } from './egg-fish-medication.gateway';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EggFishMedicationController],
  providers: [EggFishMedicationService, EggFishMedicationGateway, PrismaService],
})
export class EggFishMedicationModule {}
