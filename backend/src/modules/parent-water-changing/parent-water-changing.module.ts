import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ParentWaterChangingService } from './parent-water-changing.service';
import { ParentWaterChangingController } from './parent-water-changing.controller';

@Module({
  controllers: [ParentWaterChangingController],
  providers: [ParentWaterChangingService, PrismaService],
  exports: [ParentWaterChangingService],
})
export class ParentWaterChangingModule {}
