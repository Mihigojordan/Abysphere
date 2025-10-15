import { Module } from '@nestjs/common';
import { EggFishFeedingService } from './egg-fish-feeding.service';
import { EggFishFeedingController } from './egg-fish-feeding.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EggFishFeedingController],
  providers: [EggFishFeedingService, PrismaService],
  exports: [EggFishFeedingService],
})
export class EggFishFeedingModule {}
