import { Module } from '@nestjs/common';
import { ParentFishPoolService } from './parent-fish-pool.service';
import { ParentFishPoolController } from './parent-fish-pool.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ParentFishPoolController],
  providers: [ParentFishPoolService, PrismaService],
})
export class ParentFishPoolModule {}
