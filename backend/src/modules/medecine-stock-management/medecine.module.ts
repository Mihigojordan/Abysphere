import { Module } from '@nestjs/common';
import { MedicineService } from './medecine.service';
import { MedicineController } from './medecine.controller';
import { MedicineGateway } from './medecine.gateway';

@Module({
  controllers: [MedicineController],
  providers: [MedicineService, MedicineGateway],
})
export class MedicineModule {}
