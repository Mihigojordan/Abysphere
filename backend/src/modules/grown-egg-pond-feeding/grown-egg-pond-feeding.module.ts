import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GrownEggPondFeedingService } from './grown-egg-pond-feeding.service';
import { GrownEggPondFeedingController } from './grown-egg-pond-feeding.controller';

@Module({
  controllers: [GrownEggPondFeedingController],
  providers: [GrownEggPondFeedingService, PrismaService],
})
export class GrownEggPondFeedingModule {}
