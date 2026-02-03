import { Module } from '@nestjs/common';
import { GrownEggPondService } from './grown-egg-pond.service';
import { GrownEggPondController } from './grown-egg-pond.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [GrownEggPondController],
  providers: [GrownEggPondService, PrismaService],
  exports: [GrownEggPondService],
})
export class GrownEggPondModule {}
