import { Module } from '@nestjs/common';
import { ParentFishFeedingService } from './parent-fish-feeding.service';
import { ParentFishFeedingController } from './parent-fish-feeding.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ParentFishFeedingController],
  providers: [ParentFishFeedingService, PrismaService],
})
export class ParentFishFeedingModule {}
